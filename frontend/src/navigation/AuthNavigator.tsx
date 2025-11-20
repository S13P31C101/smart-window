import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/auth/LoginScreen';
import SocialLoginScreen from '@/screens/auth/SocialLoginScreen';
import RiveSplashScreen from '@/screens/splash/RiveSplashScreen';

// Add this type export
export type AuthNavigatorParamList = {
  Splash: undefined;
  Login: undefined;
  SocialLogin: {
    url: string;
  };
};

const Stack = createNativeStackNavigator<AuthNavigatorParamList>();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={RiveSplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SocialLogin" component={SocialLoginScreen} />
    </Stack.Navigator>
  );
}

export default AuthNavigator;