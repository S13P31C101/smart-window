import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';

// GET /users/me 응답 DTO
export interface UserInfoResponse {
  id: number;
  email: string;
  nickname: string;
}

// PUT /users/me 요청 DTO
export interface UserUpdateRequest {
  nickname: string;
}

// PUT /users/me 응답 타입
export interface SimpleMessageResponse {
  message: string;
}

// ============================================================================
// API 함수 및 커스텀 훅
// ============================================================================

// 내 정보 조회 API
const getMyInfo = async (): Promise<UserInfoResponse> => {
  const response = await apiClient.get<UserInfoResponse>('/users/me');
  return response.data;
};

export const useGetMyInfo = () => {
  return useQuery({
    queryKey: ['myInfo'],
    queryFn: getMyInfo,
  });
};

// 내 정보(닉네임) 수정 API
const updateMyInfo = async (data: UserUpdateRequest): Promise<SimpleMessageResponse> => {
  const response = await apiClient.put<SimpleMessageResponse>('/users/me', data);
  return response.data;
};

export const useUpdateMyInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInfo'] });
    },
  });
};

// 회원 탈퇴 API
const deleteMyAccount = async (): Promise<SimpleMessageResponse> => {
  const response = await apiClient.delete<SimpleMessageResponse>('/users/me');
  return response.data;
};

export const useDeleteMyAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      // 성공 시 로그아웃 처리 및 myInfo 쿼리 제거 등
      queryClient.removeQueries({ queryKey: ['myInfo'] });
      // TODO: authStore의 로그아웃 함수 호출
    },
  });
};
