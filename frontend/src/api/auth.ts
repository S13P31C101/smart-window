import { OAUTH_BASE_URL } from './axios';

/**
 * 각 소셜 로그인 제공업체별 인증 시작 URL을 생성합니다.
 * @param provider 'google', 'naver', 'kakao' 중 하나
 * @returns Spring Security OAuth2 클라이언트 인증 엔드포인트 URL
 */
export const getSocialLoginUrl = (provider: 'google' | 'naver' | 'kakao') => {
  return `${OAUTH_BASE_URL}/oauth2/authorization/${provider}`;
};
