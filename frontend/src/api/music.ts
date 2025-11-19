import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';

// 응답 DTO
export interface MusicResponse {
  musicId: number;
  musicName: string;
  musicUrl: string;
  registrantType: 'SYSTEM' | 'USER' | 'AI';
}

// 등록 요청 DTO
export interface MusicRegisterRequest {
  musicName: string;
  musicUrl: string;
  registrantType: 'USER';
}

// 수정 요청 DTO
export interface MusicUpdateRequest {
  musicName: string;
  musicUrl: string;
}

// ============================================================================
// API 함수 및 커스텀 훅
// ============================================================================

// ------------------- 음악 목록 조회 -------------------
const getMusicList = async (type?: 'system' | 'user'): Promise<MusicResponse[]> => {
  const params = type ? { type } : {};
  console.log('🚀 [음악 목록 조회 요청] GET /musics', { params });
  const response = await apiClient.get<{ data: MusicResponse[] }>('/musics', { params });
  console.log('✅ [음악 목록 조회 응답]', response.data);
  return response.data.data;
};

export const useGetMusicList = (type?: 'system' | 'user') => {
  return useQuery({
    queryKey: ['musics', type],
    queryFn: () => getMusicList(type),
  });
};

// ------------------- 음악 등록 -------------------
const registerMusic = async (data: MusicRegisterRequest): Promise<MusicResponse> => {
  console.log('🚀 [음악 등록 요청] POST /musics', data);
  const response = await apiClient.post<{ data: MusicResponse }>('/musics', data);
  console.log('✅ [음악 등록 응답]', response.data);
  return response.data.data;
};

export const useRegisterMusic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerMusic,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['musics'] }),
  });
};

// ------------------- 음악 수정 -------------------
const updateMusic = async ({
  musicId,
  ...data
}: { musicId: number } & MusicUpdateRequest): Promise<MusicResponse> => {
  console.log(`🚀 [음악 수정 요청] PUT /musics/${musicId}`, data);
  const response = await apiClient.put<{ data: MusicResponse }>(`/musics/${musicId}`, data);
  console.log(`✅ [음악 수정 응답] /musics/${musicId}`, response.data);
  return response.data.data;
};

export const useUpdateMusic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMusic,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['musics'] }),
  });
};

// ------------------- 음악 삭제 -------------------
const deleteMusic = async (musicId: number): Promise<void> => {
  console.log(`🚀 [음악 삭제 요청] DELETE /musics/${musicId}`);
  await apiClient.delete(`/musics/${musicId}`);
  console.log(`✅ [음악 삭제 완료] /musics/${musicId}`);
};

export const useDeleteMusic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMusic,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['musics'] }),
  });
};