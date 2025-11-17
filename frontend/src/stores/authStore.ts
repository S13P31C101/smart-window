import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfoResponse } from '@/api/user';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfoResponse | null;
  isLoggedIn: () => boolean; // isLoggedIn을 함수로 변경
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearTokens: () => void; // Add this line
  setUser: (user: UserInfoResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      // isLoggedIn을 상태가 아닌, accessToken의 존재 여부를 반환하는 함수로 만듭니다.
      // 이렇게 하면 상태의 원천이 하나로 유지되어 더 안정적입니다.
      isLoggedIn: () => !!get().accessToken,
      setTokens: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken,
        }),
      clearTokens: () => set({ accessToken: null, refreshToken: null }), // Add this implementation
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
    }),
    {
      name: 'auth-storage', // AsyncStorage에 저장될 때 사용될 키 이름
      storage: createJSONStorage(() => AsyncStorage), // AsyncStorage를 스토리지로 사용
    },
  ),
);
