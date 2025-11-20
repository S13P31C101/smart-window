import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native'; // View import 추가
import Rive, { Fit, Alignment } from 'rive-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/api/axios';
import { AuthNavigatorParamList } from '@/navigation/AuthNavigator'; // 네비게이션 타입 import

// 스플래시 스크린에서는 AuthNavigator 스택의 네비게이션을 사용합니다.
type SplashScreenNavigationProp = NativeStackNavigationProp<AuthNavigatorParamList>;

const RiveSplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { setTokens, clearTokens } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      // 애니메이션이 최소한으로 보여질 시간
      const minimumSplashScreenTime = 4900;
      const startTime = Date.now();

      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          // 1. 저장된 토큰이 있으면, 일단 유효하다고 가정하고 전역 스토어와 API 클라이언트에 설정
          apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          setTokens({ accessToken, refreshToken });

          // 2. 토큰 유효성 검증 API 호출 (예: 내 정보 조회)
          //    실제로는 토큰 검증용 API를 사용하는 것이 더 좋습니다.
          await apiClient.get('/api/v1/devices'); // 성공 시 토큰 유효
          console.log('[Splash] Token is valid. Navigating to Main...');
          
        } else {
          // 3. 저장된 토큰이 없으면 바로 로그인 화면으로 보낼 준비
          throw new Error('No tokens found');
        }
      } catch (error) {
        // 4. 토큰이 없거나, 유효하지 않으면 토큰 초기화
        console.log('[Splash] Token is invalid or not found. Navigating to Auth...');
        clearTokens();
        apiClient.defaults.headers.common.Authorization = null;
      } finally {
        // 5. 로직 처리 시간이 최소 시간보다 짧으면, 남은 시간만큼 기다렸다가 화면 전환
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minimumSplashScreenTime - elapsedTime;
        
        setTimeout(() => {
            // RootNavigator가 accessToken 유무에 따라 알아서 화면을 전환해주므로
            // 여기서는 특별히 어느 화면으로 가라고 지정할 필요가 없습니다.
            // (하지만 현재 RootNavigator 구조상 스플래시가 Auth 스택에 있으므로,
            // Main으로 바로 보내려면 navigation.navigate('Main') 같은 액션이 필요할 수 있습니다.
            // 지금은 RootNavigator의 로직을 신뢰하는 방향으로 둡니다.)
            
            // 현재 구조에서는 스플래시가 끝나면 Auth 스택의 다음 화면인 'Login'으로 갑니다.
            // 토큰이 성공적으로 설정되면 RootNavigator가 Main으로 바꿔치기 해줍니다.
            navigation.replace('Login');

        }, remainingTime > 0 ? remainingTime : 0);
      }
    };

    initializeApp();
  }, [navigation, setTokens, clearTokens]);

  return (
    // View로 한번 감싸고 배경색을 지정합니다.
    <View style={styles.container}> 
      <Rive
        resourceName="splashscreen"
        style={styles.rive}
        // --- fit 속성을 Cover에서 Contain으로 변경 ---
        fit={Fit.Contain} 
        alignment={Alignment.Center}
        autoplay={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // --- 스타일 수정 ---
  container: {
    flex: 1,
    backgroundColor: '#1A2F4D', // Rive 애니메이션과 동일한 배경색
  },
  rive: {
    flex: 1,
  },
  // ------------------
});

export default RiveSplashScreen;