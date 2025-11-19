import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';

// 1. ApiResponse 타입을 여기에 정의합니다.
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// ============================================================================
// 타입 정의 (backend의 dto 패키지 참고)
// ============================================================================

// backend의 MediaOrigin Enum에 해당
export type MediaOrigin =
  | 'ORIGINAL'
  | 'AI_RP'
  | 'AI_SUNSET'
  | 'AI_DAWN'
  | 'AI_AFTERNOON'
  | 'AI_NIGHT'
  | 'AI_RP_SUNSET'
  | 'AI_RP_DAWN'
  | 'AI_RP_AFTERNOON'
  | 'AI_RP_NIGHT';

// backend의 MediaType Enum에 해당
export type MediaType = 'IMAGE' | 'VIDEO';

// GET /media 응답 DTO - 백엔드 MediaResponse.java 와 일치하도록 수정
export interface MediaResponse {
  mediaId: number;
  fileName: string;
  downloadUrl: string; // s3Url -> downloadUrl 필드명 변경 및 나머지 필드 추가
  fileType: MediaType;
  originType: MediaOrigin;
  parentMediaId: number | null;
  fileSize: number;
  resolution: string | null;
  createdAt: string; // OffsetDateTime은 JSON에서 string으로 변환됩니다.
}

// POST /media/upload-url 요청 DTO
export interface MediaUploadRequest {
  fileName: string;
  fileType: MediaType; // 'contentType'에서 'fileType'으로, 'string'에서 'MediaType'으로 변경
}

// POST /media/upload-url 응답 DTO - 백엔드 MediaUploadResponse.java 와 일치하도록 수정
export interface MediaUploadResponse {
  s3ObjectKey: string;
  fileUrl: string; // Pre-signed URL
}

// POST /media/upload 요청 DTO - 백엔드 MediaRegisterRequest.java 와 일치하도록 수정
export interface MediaRegisterRequest {
  s3ObjectKey: string;
  fileName: string;
  fileType: MediaType;
  originType: MediaOrigin;
  deviceId: number; // 이 필드를 추가하세요.
  fileSize: number;
  resolution: string | null;
}

// 백엔드 응답이 이중으로 감싸여 있어, 이를 처리하기 위한 래퍼(wrapper) 타입입니다.
// 실제 데이터는 `data` 속성 안에 들어있습니다.
interface BackendSuccessResponse<T> {
  status: number;
  data: T;
}

// ============================================================================
// API 함수 및 커스텀 훅
// ============================================================================

// ------------------- C-1: 미디어 파일 목록 조회 -------------------
const getMyMedia = async (): Promise<MediaResponse[]> => {
  const response = await apiClient.get<BackendSuccessResponse<MediaResponse[]>>(
    '/media',
  );
  return response.data.data;
};

export const useGetMyMedia = () => {
  return useQuery({
    queryKey: ['myMedia'],
    queryFn: getMyMedia,
  });
};

// ------------------- C-2: 미디어 파일 등록 요청 (업로드 URL 받기) -------------------
const requestMediaUploadUrl = async (
  body: MediaUploadRequest,
): Promise<MediaUploadResponse> => {
  const response = await apiClient.post<any>( // 1. 응답 타입을 any로 임시 변경
    '/media/upload-url',
    body,
  );

  console.log('백엔드 /media/upload-url 응답:', JSON.stringify(response.data, null, 2));
  
  // 2. 실제 응답 구조에 맞춰 데이터에 접근합니다.
  const responseData = response.data.data;

  // 3. 응답 데이터가 유효한지 확인하고 반환합니다.
  if (responseData && responseData.s3ObjectKey && responseData.fileUrl) {
    return responseData;
  } else {
    // 4. 유효하지 않은 경우, 구체적인 에러를 던집니다.
    throw new Error('백엔드로부터 유효한 Pre-signed URL을 받지 못했습니다.');
  }
};

export const useRequestMediaUploadUrl = () => {
  return useMutation<MediaUploadResponse, Error, MediaUploadRequest>({
    mutationFn: requestMediaUploadUrl,
  });
};

// ------------------- C-3: 미디어 파일 등록 (업로드 완료 보고) -------------------
const registerMedia = async (
  body: MediaRegisterRequest,
): Promise<MediaResponse> => {
  // 백엔드로 '/media/upload' API 요청을 보내기 직전의 데이터를 출력합니다.
  console.log('백엔드 /media/upload 요청:', JSON.stringify(body, null, 2));

  const response = await apiClient.post<BackendSuccessResponse<MediaResponse>>(
    '/media/upload',
    body,
  );

  // 백엔드로부터 받은 응답 전체를 출력합니다.
  console.log('백엔드 /media/upload 응답:', JSON.stringify(response.data, null, 2));

  // requestMediaUploadUrl 와 마찬가지로 실제 데이터는 data 속성 안에 있습니다.
  return response.data.data;
};

export const useRegisterMedia = () => {
  return useMutation({
    mutationFn: registerMedia,
  });
};

// ------------------- C-4: 미디어 파일 상세 조회 -------------------
const getMediaDetail = async (mediaId: number): Promise<MediaResponse> => {
  const response = await apiClient.get(`/media/${mediaId}`);
  return response as unknown as MediaResponse;
};

export const useGetMediaDetail = (mediaId?: number | null) => { // mediaId가 optional
  return useQuery({
    queryKey: ['mediaDetail', mediaId],
    queryFn: () => getMediaDetail(mediaId!), // non-null assertion
    enabled: !!mediaId, // mediaId가 truthy일 때만 실행
  });
};

// ------------------- C-5: 미디어 파일 별명 변경 -------------------
export interface UpdateMediaNameRequest {
  mediaId: number;
  fileName: string;
}

const updateMediaName = async ({
  mediaId,
  fileName,
}: UpdateMediaNameRequest): Promise<MediaResponse> => {
  const response = await apiClient.patch<BackendSuccessResponse<MediaResponse>>(
    `/media/${mediaId}/name`,
    { fileName },
  );
  // 다른 API와 마찬가지로, 실제 데이터는 response.data.data에 있습니다.
  return response.data.data;
};

export const useUpdateMediaName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMediaName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMedia'] });
    },
  });
};

// ------------------- C-6: 미디어 파일 삭제 -------------------
const deleteMedia = async (mediaId: number): Promise<void> => {
  // 여기는 반환값이 없으므로 수정할 필요가 없습니다.
  await apiClient.delete(`/media/${mediaId}`);
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMedia'] });
    },
  });
};
