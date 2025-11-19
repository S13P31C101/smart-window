import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator'; // MainNavigator를 import

function RootNavigator() {
  const { accessToken } = useAuthStore();

  // 로그인 후 MainNavigator를 보여주도록 수정합니다.
  return accessToken ? <MainNavigator /> : <AuthNavigator />;
}

export default RootNavigator;
