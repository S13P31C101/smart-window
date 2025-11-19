import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useAuthStore } from '@/stores/authStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { COLORS } from '@/constants/color';
import { useFocusEffect } from '@react-navigation/native';

// 👇 1. 안드로이드 크롬 브라우저의 일반적인 User Agent 문자열을 정의합니다.
const ANDROID_USER_AGENT = "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36";

type Props = NativeStackScreenProps<AuthStackParamList, 'SocialLogin'>;

// 이전 코드의 안정적인 스크립트를 그대로 사용합니다.
const INJECTED_JAVASCRIPT = `
  (function() {
    try {
      const pre = document.querySelector('pre');
      const content = pre ? pre.textContent : document.body.innerText;
      JSON.parse(content);
      document.body.style.display = 'none';
      window.ReactNativeWebView.postMessage(content);
    } catch (e) {
      // JSON이 아니면 무시
    }
    return true;
  })();
`;

function SocialLoginScreen({ route }: Props) {
  // 👇 2. route.params에서 'provider'를 받아옵니다.
  const { url: initialUrl, provider } = route.params;
  const { setTokens } = useAuthStore();
  
  // 1. WebView를 강제로 새로고침(재마운트)하기 위한 상태
  const [webViewKey, setWebViewKey] = useState(0);
  const [url, setUrl] = useState(initialUrl); // This state variable is fine

  // 2. 화면에 들어올 때마다 WebView를 리셋하여 새로운 세션을 보장합니다.
  useFocusEffect(
    useCallback(() => {
      // WebView의 key를 변경하면 컴포넌트가 완전히 새로 렌더링되어 상태가 초기화됩니다.
      setWebViewKey(prevKey => prevKey + 1);
      // URL에 랜덤 파라미터를 추가하여 웹 캐시 사용을 방지합니다.
      const randomUrl = `${initialUrl}?random=${Math.random()}`;
      setUrl(randomUrl);
      // 👇 [로그 추가] 화면이 포커스될 때마다 WebView가 리셋되는지 확인합니다.
      console.log('[SocialLoginScreen] 화면 포커스됨. WebView 리셋 및 URL 캐시 방지:', randomUrl);
    }, [initialUrl])
  );
  
  const handleMessage = (event: any) => {
    try {
      // 👇 [로그 추가] 백엔드로부터 받은 최종 메시지(JSON)를 확인합니다.
      console.log('[SocialLoginScreen] WebView로부터 메시지 수신:', event.nativeEvent.data);
      const response = JSON.parse(event.nativeEvent.data);
      const { accessToken, refreshToken } = response.data;

      if (accessToken && refreshToken) {
        console.log('[SocialLoginScreen] 토큰 파싱 성공! accessToken:', accessToken);
        setTokens({ accessToken, refreshToken });
      } else {
        console.error('[SocialLoginScreen] 응답 데이터에 토큰이 없습니다:', response);
      }
    } catch (error) {
      console.error('[SocialLoginScreen] WebView 메시지 파싱 실패:', error, '원본 데이터:', event.nativeEvent.data);
    }
  };

  // 👇 2. WebView의 URL이 변경될 때마다 로그를 찍는 함수를 추가합니다.
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    console.log('[SocialLoginScreen] WebView URL 변경:', navState.url);
  };

  return (
    <View style={styles.container}>
      <WebView
        key={webViewKey} // key prop을 사용하여 WebView를 강제로 리셋
        source={{ uri: url }} // 👈 받은 URL을 그대로 WebView에 띄움
        // 👇 3. provider가 'google'일 때만 userAgent를 변경하도록 설정합니다.
        userAgent={provider === 'google' ? ANDROID_USER_AGENT : undefined}
        onMessage={handleMessage}
        // 👇 3. WebView에 로깅을 위한 prop들을 추가합니다.
        onNavigationStateChange={handleNavigationStateChange} // URL 변경 감지
        onError={(event) => console.error('[SocialLoginScreen] WebView 에러 발생:', event.nativeEvent)} // WebView 자체 에러 감지
        injectedJavaScript={INJECTED_JAVASCRIPT}
        javaScriptEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color={COLORS.textAccent}
            style={styles.loading}
          />
        )}
        // 3. WebView 자체 옵션으로 세션을 격리합니다.
        incognito={true}
        cacheEnabled={false}
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
