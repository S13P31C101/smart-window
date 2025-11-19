import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';
import { useAuthStore } from '@/stores/authStore';

// ============================================================================
// API 함수
// ============================================================================

/**
 * 로그아웃 API
 * 서버에 저장된 Refresh Token을 무효화합니다.
 */
// 1. 함수가 accessToken을 인자로 받도록 수정합니다.
export const logout = async (accessToken: string): Promise<void> => {
  // 2. apiClient 요청 시 헤더를 직접 설정하여 토큰을 전달합니다.
  await apiClient.post('/tokens/logout', {}, { // body를 빈 객체로 전달
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json', // 명시적으로 Content-Type 설정
    },
  });
};

/**
 * FCM 모바일 토큰 등록을 위한 요청 DTO
 */
export interface FcmTokenRequest {
  fcmToken: string;
}

/**
 * FCM 모바일 토큰 등록 API
 * @param data 사용자의 FCM 토큰을 담은 객체
 */
const registerFcmToken = async (data: FcmTokenRequest): Promise<void> => {
  await apiClient.post('/tokens/mobile', data);
};

// ============================================================================
// 커스텀 훅 (useMutation)
// ============================================================================

/**
 * 로그아웃을 위한 useMutation 훅
 * @description onSuccess/onError 등 추가 로직은 이 훅을 사용하는 컴포넌트나 스토어에서 처리합니다.
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  
  // 여기서 getState()를 호출하지 않습니다.

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 성공 시점에서 최신 상태를 가져와서 사용합니다.
      useAuthStore.getState().clearTokens();
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // 실패 시점에서도 최신 상태를 가져와서 사용합니다.
      useAuthStore.getState().clearTokens();
      queryClient.clear();
    },
  });
};

/**
 * FCM 토큰 등록을 위한 useMutation 훅
 */
export const useRegisterFcmTokenMutation = () => {
  return useMutation({
    mutationFn: registerFcmToken,
  });
};