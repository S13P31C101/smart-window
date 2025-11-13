import React from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native'; // Button 추가
import { SafeAreaView } from 'react-native-safe-area-context';
import SocialLoginButton from '@/components/SocialLoginButton';
import { COLORS } from '@/constants/color'; // 1. COLORS import 추가
import { useNavigation } from '@react-navigation/native'; // 1. useNavigation import
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // 1. import 경로 수정
import { AuthStackParamList } from '@/navigation/AuthNavigator'; // 3. AuthStackParamList import
import { getSocialLoginUrl } from '@/api/auth'; // 4. getSocialLoginUrl import
import { useAuthStore } from '@/stores/authStore'; // 1. Auth Store import

// 2. 타입 이름 수정
type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

function LoginScreen() {
  const navigation = useNavigation<NavigationProp>(); // 6. navigation 객체 생성
  const { setTokens } = useAuthStore(); // 2. setTokens 함수 가져오기

  // 7. handleLogin 함수 수정
  const handleLogin = (provider: 'google' | 'naver' | 'kakao') => {
    const url = getSocialLoginUrl(provider);
    navigation.navigate('SocialLogin', { provider, url });
  };

  // 3. 개발용 로그인 핸들러 추가
  const handleDevLogin = () => {
    console.log('--- DEVELOPMENT LOGIN ---');
    console.log('Bypassing social login with fake tokens.');
    setTokens({
      accessToken: 'fake-access-token-for-development',
      refreshToken: 'fake-refresh-token-for-development',
    });
    // setTokens가 호출되면 RootNavigator가 상태 변화를 감지하고 자동으로 홈 화면으로 이동시킵니다.
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/* TODO: 로고 이미지로 교체 */}
          <View style={styles.logoPlaceholder} />
          <Text style={styles.title}>SMART WINDOW</Text>
          <Text style={styles.subtitle}>스마트 창문 제어 시스템</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Text style={styles.infoText}>소셜 계정으로 간편하게 로그인하세요</Text>
          <SocialLoginButton provider="google" onPress={() => handleLogin('google')} />
          <SocialLoginButton provider="naver" onPress={() => handleLogin('naver')} />
          <SocialLoginButton provider="kakao" onPress={() => handleLogin('kakao')} />

          {/* 4. 개발 모드에서만 보이는 로그인 버튼 추가 */}
          {__DEV__ && (
            <View style={{ marginTop: 20 }}>
              <Button
                title="🚀 개발용 로그인"
                onPress={handleDevLogin}
                color={COLORS.textAccent}
              />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </Text>
          <Text style={styles.footerText}>
            © 2025 SMART WINDOW. All rights reserved.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // 2. 색상 교체
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.surfacePlaceholder, // 2. 색상 교체
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: COLORS.textPrimary, // 2. 색상 교체
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary, // 2. 색상 교체
  },
  buttonContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  infoText: {
    color: COLORS.textSecondary, // 2. 색상 교체
    textAlign: 'center',
    marginBottom: 20,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textDisabled, // 2. 색상 교체
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default LoginScreen;
