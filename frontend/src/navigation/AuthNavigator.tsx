import React from 'react';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import LoginScreen from '@/screens/auth/LoginScreen';
import SocialLoginScreen from '@/screens/auth/SocialLoginScreen';
import { COLORS } from '@/constants/color';

// 2. 파라미터 타입 정의
export type AuthStackParamList = {
  Login: undefined;
  SocialLogin: {
    provider: 'kakao' | 'google' | 'naver';
    url: string;
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      {/* 3. SocialLoginScreen 추가 */}
      <Stack.Screen
        name="SocialLogin"
        component={SocialLoginScreen}
        options={({
          route,
        }: NativeStackScreenProps<AuthStackParamList, 'SocialLogin'>) => ({
          title: `${
            route.params.provider.charAt(0).toUpperCase() +
            route.params.provider.slice(1)
          } 로그인`,
          headerStyle: {
            backgroundColor: COLORS.surfaceMain,
          },
          headerTintColor: COLORS.textPrimary,
        })}
      />
    </Stack.Navigator>
  );
}

export default AuthNavigator;