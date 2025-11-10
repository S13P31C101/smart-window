import { OAUTH_BASE_URL } from './axios';

// 소셜 로그인 제공자 타입
export type AuthProvider = 'kakao' | 'google' | 'naver';

/**
 * 우리 백엔드 서버가 로그인 성공 후 앱으로 리디렉션할 때
 * URL 파라미터 등을 통해 전달해줄 데이터의 타입입니다.
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  // ... 기타 필요한 사용자 정보가 있다면 여기에 추가
}

export const getSocialLoginUrl = (provider: AuthProvider): string => {
  return `${OAUTH_BASE_URL}/oauth2/authorization/${provider}`;
};
