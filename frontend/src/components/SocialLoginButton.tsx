import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface SocialLoginButtonProps {
  provider: 'google' | 'naver' | 'kakao';
  onPress: () => void;
}

const providerStyles = {
  google: {
    container: { backgroundColor: '#FFFFFF' },
    text: { color: '#000000' },
    label: 'Google로 계속하기',
  },
  naver: {
    container: { backgroundColor: '#03C75A' },
    text: { color: '#FFFFFF' },
    label: '네이버로 계속하기',
  },
  kakao: {
    container: { backgroundColor: '#FEE500' },
    text: { color: '#000000' },
    label: '카카오로 계속하기',
  },
};

function SocialLoginButton({ provider, onPress }: SocialLoginButtonProps) {
  const styles = providerStyles[provider];

  return (
    <TouchableOpacity
      style={[buttonStyles.container, styles.container]}
      onPress={onPress}>
      <View style={buttonStyles.iconContainer}>
        {/* TODO: 여기에 각 소셜 아이콘 추가 */}
        <Text style={styles.text}>{provider.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={[buttonStyles.text, styles.text]}>{styles.label}</Text>
    </TouchableOpacity>
  );
}

const buttonStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconContainer: {
    position: 'absolute',
    left: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SocialLoginButton;
