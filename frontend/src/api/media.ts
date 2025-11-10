import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from './axios';

// ============================================================================
// 타입 정의 (backend의 dto 패키지 참고)
// ============================================================================

// backend의 MediaOrigin Enum에 해당
export type MediaOrigin = 'ORIGINAL' | 'AI_GENERATED';

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
interface MediaUploadRequest {
  fileName: string;
  fileType: MediaType; // 'contentType'에서 'fileType'으로, 'string'에서 'MediaType'으로 변경
}

// POST /media/upload-url 응답 DTO - 백엔드 MediaUploadResponse.java 와 일치하도록 수정
interface MediaUploadResponse {
  s3ObjectKey: string;
  fileUrl: string; // Pre-signed URL
}

// POST /media/upload 요청 DTO - 백엔드 MediaRegisterRequest.java 와 일치하도록 수정
interface MediaRegisterRequest {
  s3ObjectKey: string;
  fileName: string;
  fileType: MediaType;
  fileSize: number;
  resolution: string | null;
}

// ============================================================================
// API 함수 및 커스텀 훅
// ============================================================================

// ------------------- C-1: 미디어 파일 목록 조회 -------------------
const getMyMedia = async (): Promise<MediaResponse[]> => {
  const response = await apiClient.get<MediaResponse[]>('/media');
  return response.data;
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
  const response = await apiClient.post<MediaUploadResponse>(
    '/media/upload-url',
    body,
  );
  return response.data;
};

export const useRequestMediaUploadUrl = () => {
  return useMutation({
    mutationFn: requestMediaUploadUrl,
  });
};

// ------------------- C-3: 미디어 파일 등록 (업로드 완료 보고) -------------------
const registerMedia = async (
  body: MediaRegisterRequest,
): Promise<MediaResponse> => {
  const response = await apiClient.post<MediaResponse>('/media/upload', body);
  return response.data;
};

export const useRegisterMedia = () => {
  return useMutation({
    mutationFn: registerMedia,
  });
};

// ------------------- C-4: 미디어 파일 상세 조회 -------------------
const getMediaDetail = async (mediaId: number): Promise<MediaResponse> => {
  const response = await apiClient.get<MediaResponse>(`/media/${mediaId}`);
  return response.data;
};

export const useGetMediaDetail = (mediaId: number) => {
  return useQuery({
    queryKey: ['mediaDetail', mediaId],
    queryFn: () => getMediaDetail(mediaId),
    enabled: !!mediaId, // mediaId가 있을 때만 쿼리를 실행합니다.
  });
};

// ------------------- C-5: 미디어 파일 별명 변경 -------------------
interface UpdateMediaNameRequest {
  mediaId: number;
  fileName: string;
}

const updateMediaName = async ({
  mediaId,
  fileName,
}: UpdateMediaNameRequest): Promise<MediaResponse> => {
  const response = await apiClient.put<MediaResponse>(
    `/media/${mediaId}/name`,
    { fileName }, // 백엔드에서 Map<String, String>으로 받으므로 이 형식으로 보냅니다.
  );
  return response.data;
};

export const useUpdateMediaName = () => {
  return useMutation({
    mutationFn: updateMediaName,
    // TODO: 성공 시 목록 쿼리 무효화 등 추가 작업
  });
};

// ------------------- C-6: 미디어 파일 삭제 -------------------
const deleteMedia = async (mediaId: number): Promise<void> => {
  await apiClient.delete(`/media/${mediaId}`);
};

export const useDeleteMedia = () => {
  return useMutation({
    mutationFn: deleteMedia,
    // TODO: 성공 시 목록 쿼리 무효화 등 추가 작업
  });
};
