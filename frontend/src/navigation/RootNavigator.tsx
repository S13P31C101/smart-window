import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator'; // MainNavigator 대신 BottomTabNavigator를 import

function RootNavigator() {
  const { accessToken } = useAuthStore();

  // accessToken이 있으면 메인 앱(하단 탭 포함)을, 없으면 인증 스크린을 보여줍니다.
  return accessToken ? <BottomTabNavigator /> : <AuthNavigator />;
}

export default RootNavigator;
