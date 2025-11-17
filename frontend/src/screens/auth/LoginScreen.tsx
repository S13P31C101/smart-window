import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SocialLoginButton from '@/components/SocialLoginButton';
import { COLORS } from '@/constants/color';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { getSocialLoginUrl } from '@/api/auth';
import AppLogo from '@/assets/smartwindow_icon-v1.jpg'; // 1. 로고 이미지 import

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleLogin = (provider: 'google' | 'naver' | 'kakao') => {
    const url = getSocialLoginUrl(provider);
    // 👇 [로그 추가] 생성된 URL을 콘솔에 출력합니다.
    console.log(`[LoginScreen] ${provider} 로그인 시도. 생성된 URL:`, url);
    // 👇 SocialLoginScreen으로 'provider'와 'url'을 함께 전달합니다.
    navigation.navigate('SocialLogin', { provider, url });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/* 2. 로고 이미지를 표시합니다. */}
          <Image source={AppLogo} style={styles.logo} />
          <Text style={styles.title}>SMART WINDOW</Text>
          <Text style={styles.subtitle}>스마트 창문 제어 시스템</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Text style={styles.infoText}>소셜 계정으로 간편하게 로그인하세요</Text>
          <SocialLoginButton provider="google" onPress={() => handleLogin('google')} />
          <SocialLoginButton provider="naver" onPress={() => handleLogin('naver')} />
          <SocialLoginButton provider="kakao" onPress={() => handleLogin('kakao')} />
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
  // 4. 로고 스타일을 추가하고, 기존 플레이스홀더 스타일은 제거합니다.
  logo: {
    width: 100,
    height: 100,
    borderRadius: 22,
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
