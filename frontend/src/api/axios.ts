import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'; // 1. authStore를 import 합니다.

const isDevelopment = __DEV__;
const DEV_DOMAIN = 'http://localhost:8080';
const PROD_DOMAIN = 'https://k13c101.p.ssafy.io';
const API_DOMAIN = isDevelopment ? DEV_DOMAIN : PROD_DOMAIN;

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
 * [확장 포인트]
 * 응답 인터셉터: 모든 API 응답을 받고 난 후에 공통으로 처리할 로직
 * 예: 토큰 만료 시 자동으로 토큰 갱신 또는 로그인 페이지로 이동
 */
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // if (error.response.status === 401) {
    //   // 토큰 갱신 또는 로그아웃 처리
    // }
    return Promise.reject(error);
  },
);

export default apiClient;
