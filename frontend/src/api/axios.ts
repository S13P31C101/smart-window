import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore'; // 1. Zustand 스토어 import

// const isDevelopment = __DEV__; // 1. 원래 코드는 잠시 주석 처리합니다.
const isDevelopment = false; // 2. 이 값을 false로 강제하여 실서버를 바라보게 합니다.

const DEV_DOMAIN = 'http://localhost:8080';
const PROD_DOMAIN = 'https://k13c101.p.ssafy.io';
const API_DOMAIN = isDevelopment ? DEV_DOMAIN : PROD_DOMAIN; // 이제 API_DOMAIN은 PROD_DOMAIN이 됩니다.

export const OAUTH_BASE_URL = API_DOMAIN;
export const API_BASE_URL = `${API_DOMAIN}/api/v1`;

// Axios 인스턴스 생성 및 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * [확장 포인트]
 * 요청 인터셉터: 모든 API 요청이 보내지기 전에 공통으로 처리할 로직
 * 예: Zustand 스토어에서 토큰을 가져와 헤더에 추가
 */
apiClient.interceptors.request.use(
  config => {
    // 2. Zustand 스토어에서 현재 상태를 가져옵니다.
    const { accessToken } = useAuthStore.getState();

    // 3. 토큰이 있다면 헤더에 추가합니다.
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

/**
 * 응답 인터셉터: 모든 API 응답을 받은 후 공통 로직 처리
 */
apiClient.interceptors.response.use(
  response => {
    // 응답을 가공하지 않고 그대로 반환합니다.
    return response;
  },
  async (error: AxiosError) => {
    // _retry 속성은 무한 재시도를 방지하기 위한 플래그입니다.
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const { refreshToken, setTokens, clearTokens } = useAuthStore.getState();

    // 401 에러이고, 재시도한 요청이 아니며, 리프레시 토큰이 있을 경우
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true; // 재시도 플래그 설정

      try {
        // 토큰 재발급 API 호출
        const response = await axios.post(`${API_BASE_URL}/tokens/reissue`, {
          refreshToken,
        });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // 새로운 토큰을 스토어와 apiClient 기본 헤더에 저장
        setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
        // 다음 요청부터 새로운 토큰을 사용하도록 기본 헤더도 업데이트
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        // 현재 실패한 요청의 헤더도 새로운 토큰으로 교체
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 실패했던 원래 요청을 새로운 토큰으로 재시도
        return apiClient(originalRequest);
      } catch (reissueError) {
        // 리프레시 토큰도 만료되었거나, 재발급 실패 시 로그아웃 처리
        clearTokens();
        // TODO: 로그인 페이지로 이동하는 로직 추가
        return Promise.reject(reissueError);
      }
    }

    // We cast `error.response.data` to a known shape to safely access its properties.
    const data = error.response?.data as { message?: string };

    if (data?.message) {
      return Promise.reject(new Error(data.message));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
