import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfoResponse } from '@/api/user';
import { logout as logoutApi } from '@/api/token'; // 1. 로그아웃 API 함수 import
import queryClient from '@/api/queryClient'; // Fix: Correct import for default export

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfoResponse | null;
  isLoggedIn: () => boolean;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearTokens: () => void;
  setUser: (user: UserInfoResponse) => void;
  logout: () => Promise<void>; // 3. logout을 Promise를 반환하는 async 함수로 변경
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoggedIn: () => !!get().accessToken,
      setTokens: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken,
        }),
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
      setUser: (user) => set({ user }),
      // 4. logout 로직 수정
      logout: async () => {
        const { accessToken } = get();

        // --- 디버깅을 위한 console.log 추가 ---
        console.log('[AuthStore] Logout initiated. Access Token:', accessToken);
        // ------------------------------------

        if (accessToken) {
          try {
            await logoutApi(accessToken);
            console.log('[AuthStore] Logout API call successful.'); // 성공 로그
          } catch (error) {
            // 이 부분은 이미 console.error가 있으므로 그대로 둡니다.
            console.error('Logout API failed:', error);
          }
        }
        
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
        queryClient.clear();
        console.log('[AuthStore] Client state cleared.'); // 상태 초기화 로그
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
