import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

function RootNavigator() {
  const { isLoggedIn } = useAuthStore();

  return isLoggedIn() ? <MainNavigator /> : <AuthNavigator />;
}

export default RootNavigator;
