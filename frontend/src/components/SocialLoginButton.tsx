import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg'; // 1. react-native-svg import 추가

// 2. 제공된 SVG 코드를 React Native에서 사용할 수 있는 아이콘 컴포넌트로 변환합니다.
const GoogleIcon = ({ width = 24, height = 24 }: { width?: number; height?: number }) => (
  <Svg viewBox="0 0 48 48" width={width} height={height}>
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <Path fill="none" d="M0 0h48v48H0z" />
  </Svg>
);

interface SocialLoginButtonProps {
  provider: 'google' | 'naver' | 'kakao';
  onPress: () => void;
}

const providerAssets = {
  google: {
    container: { backgroundColor: '#FFFFFF' },
    text: { color: '#1E2939' },
    label: 'Google로 계속하기',
    // 3. Google의 이미지 아이콘 설정을 제거합니다.
  },
  naver: {
    container: { backgroundColor: '#03C75A' },
    text: { color: '#FFFFFF' },
    label: '네이버로 계속하기',
    icon: require('@/assets/icons/naver.png'),
  },
  kakao: {
    container: { backgroundColor: '#FEE500' },
    // 1. 카카오 디자인 가이드에 따라 텍스트 색상을 검은색의 85% 투명도로 변경합니다.
    text: { color: 'rgba(0, 0, 0, 0.85)' },
    label: '카카오로 계속하기',
    icon: require('@/assets/icons/kakao.png'),
  },
};

function SocialLoginButton({ provider, onPress }: SocialLoginButtonProps) {
  const assets = providerAssets[provider];

  // A helper function to render the correct icon based on the provider.
  // This helps TypeScript understand which assets are available in each case.
  const renderIcon = () => {
    switch (provider) {
      case 'google':
        return <GoogleIcon />;
      // For naver and kakao, we know the 'icon' property exists.
      case 'naver':
      case 'kakao':
        return <Image source={assets.icon} style={buttonStyles.icon} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[buttonStyles.container, assets.container]}
      onPress={onPress}>
      <View style={buttonStyles.iconContainer}>
        {/* Use the helper function to render the icon */}
        {renderIcon()}
      </View>
      <Text style={[buttonStyles.text, assets.text]}>{assets.label}</Text>
    </TouchableOpacity>
  );
}

const buttonStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    // 2. 카카오 디자인 가이드에 따라 borderRadius를 12로 수정합니다.
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    position: 'absolute',
    left: 24,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SocialLoginButton;
