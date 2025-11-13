import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useAuthStore } from '@/stores/authStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/color';

type Props = NativeStackScreenProps<AuthStackParamList, 'SocialLogin'>;

// 백엔드의 AuthController에 명시된 성공 경로와 일치시킵니다.
const REDIRECT_PATH = '/auth/success';

// 웹페이지의 pre 태그 안에 있는 JSON 문자열을 파싱하기 위한 Javascript 코드
const INJECTED_JAVASCRIPT = `
  const pre = document.querySelector('pre');
  const json = JSON.parse(pre.innerText);
  window.ReactNativeWebView.postMessage(JSON.stringify(json));
  true;
`;

function SocialLoginScreen({ route }: Props) {
  const { url } = route.params;
  const { setTokens } = useAuthStore();

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    // URL에 REDIRECT_PATH가 포함되어 있는지 확인
    if (navState.url.includes(REDIRECT_PATH)) {
      // WebView의 JS 실행을 막아 다른 페이지로 이동하는 것을 방지
      // 이 시점부터는 postMessage로 데이터를 받습니다.
      webViewRef.current?.stopLoading();
    }
  };

  const handleMessage = (event: any) => {
    try {
      const { accessToken, refreshToken } = JSON.parse(event.nativeEvent.data);

      if (accessToken && refreshToken) {
        // Zustand 스토어에 토큰 저장 -> RootNavigator가 감지하여 홈으로 이동
        setTokens({ accessToken, refreshToken });
      }
    } catch (error) {
      console.error('Failed to parse token from WebView', error);
      // 에러 처리 (예: 로그인 화면으로 다시 보내기)
    }
  };

  const webViewRef = React.useRef<WebView>(null);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color={COLORS.textAccent}
            style={styles.loading}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
  },
});

export default SocialLoginScreen;
