import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '@/navigation/RootNavigator';
import queryClient from '@/api/queryClient';
import './src/services/fcmService';
import { useAuthStore } from '@/stores/authStore';

function App(): React.JSX.Element {
  // 테스트를 위해 주기적으로 토큰을 콘솔에 출력하는 로직
  useEffect(() => {
    // 2분(120000ms)마다 실행되는 인터벌 설정
    const intervalId = setInterval(() => {
      // authStore에서 현재 토큰 상태를 가져옵니다.
      const { accessToken, refreshToken } = useAuthStore.getState();

      // 로그인 상태일 때만 (accessToken이 있을 때) 로그를 출력합니다.
      if (accessToken) {
        console.log('--- 🔑 Token Check (2 min cycle) ---');
        console.log('AccessToken:', accessToken ? `...${accessToken.slice(-10)}` : null);
        console.log('RefreshToken:', refreshToken ? `...${refreshToken.slice(-10)}` : null);
        console.log('---------------------------------');
      }
    }, 120000); // 주기를 10초에서 2분으로 변경

    // 컴포넌트가 언마운트될 때 인터벌을 정리하여 메모리 누수를 방지합니다.
    return () => clearInterval(intervalId);
  }, []); // 빈 배열을 전달하여 앱이 처음 마운트될 때 한 번만 실행되도록 합니다.

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
