import { useMutation, useQuery } from '@tanstack/react-query';
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

// ============================================================================
// API 함수 및 커스텀 훅
// ============================================================================

// 내 정보 조회 API
const getMyInfo = async (): Promise<UserInfoResponse> => {
  const response = await apiClient.get<UserInfoResponse>('/users/me'); // API 엔드포인트는 백엔드 확인 필요
  return response.data;
};

export const useGetMyInfo = () => {
  // 로그인한 사용자 정보는 자주 바뀌지 않으므로 staleTime을 길게 설정할 수 있습니다.
  return useQuery({
    queryKey: ['myInfo'],
    queryFn: getMyInfo,
  });
};

// 내 정보(닉네임) 수정 API
const updateMyInfo = async (
  data: UserUpdateRequest,
): Promise<UserInfoResponse> => {
  const response = await apiClient.put<UserInfoResponse>('/users/me', data); // API 엔드포인트는 백엔드 확인 필요
  return response.data;
};

export const useUpdateMyInfo = () => {
  return useMutation({
    mutationFn: updateMyInfo,
    // TODO: 성공 시 'myInfo' 쿼리 무효화 등 추가 작업
  });
};
