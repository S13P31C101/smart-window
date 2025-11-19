import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';

// java.time.DayOfWeek Enum에 해당
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// 알람 응답 DTO (AlarmResponse.java)
export interface AlarmResponse {
  alarmId: number;
  deviceId: number;
  alarmName: string;
  alarmTime: string; // HH:mm:ss 형식의 string
  repeatDays: DayOfWeek[];
  isActive: boolean;
  createdAt: string;
}

// 알람 생성 요청 DTO (AlarmCreateRequest.java)
export interface AlarmCreateRequest {
  deviceId: number;
  alarmName: string;
  alarmTime: string; // HH:mm:ss 형식의 string
  repeatDays: DayOfWeek[];
  isActive: boolean;
}

// 알람 수정 요청 DTO (AlarmUpdateRequest.java)
export interface AlarmUpdateRequest {
  alarmName?: string;
  alarmTime?: string;
  repeatDays?: DayOfWeek[];
  isActive?: boolean;
}

// ============================================================================
// API 함수 및 커스텀 훅
// ============================================================================

// ------------------- D-1: 전체 알람 목록 조회 -------------------
const getAllAlarms = async (): Promise<AlarmResponse[]> => {
  const response = await apiClient.get<AlarmResponse[]>('/alarms');
  return response.data;
};

export const useGetAllAlarms = () => {
  return useQuery({ queryKey: ['alarms'], queryFn: getAllAlarms });
};

// ------------------- D-6: 기기 알람 목록 조회 -------------------
const getDeviceAlarms = async (deviceId: number): Promise<AlarmResponse[]> => {
  console.log(`🚀 [알람 목록 조회 요청] GET /devices/${deviceId}/alarms`);
  
  // API 응답의 전체 구조를 올바르게 타입으로 지정합니다.
  const response = await apiClient.get<{ status: number; data: AlarmResponse[] }>(`/devices/${deviceId}/alarms`);
  
  console.log(`✅ [알람 목록 조회 응답]`, JSON.stringify(response.data, null, 2));
  
  // FlatList가 원하는 실제 알람 배열인 response.data.data를 반환합니다.
  return response.data.data;
};

export const useGetDeviceAlarms = (deviceId: number) => {
  return useQuery({
    queryKey: ['alarms', 'device', deviceId],
    queryFn: () => getDeviceAlarms(deviceId),
    // deviceId가 유효한 숫자일 때만 이 쿼리를 실행합니다.
    enabled: !!deviceId,
  });
};

// ------------------- D-2: 알람 생성 -------------------
const createAlarm = async (data: AlarmCreateRequest): Promise<AlarmResponse> => {
  const response = await apiClient.post<AlarmResponse>('/alarms', data);
  return response.data;
};

export const useCreateAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlarm,
    onSuccess: (data) => {
      console.log('✅ 알람 생성 성공! 알람 목록을 새로고침합니다.');
      // deviceId까지 포함하는 대신, 'alarms'와 'device' 키를 가진 모든 쿼리를 무효화합니다.
      queryClient.invalidateQueries({ queryKey: ['alarms', 'device'] });
    },
    onError: (error) => {
      console.error('⛔ 알람 생성 실패:', error);
    },
  });
};

// ------------------- D-3: 알람 조회 -------------------
const getAlarmDetail = async (alarmId: number): Promise<AlarmResponse> => {
  const response = await apiClient.get<AlarmResponse>(`/alarms/${alarmId}`);
  return response.data;
};

export const useGetAlarmDetail = (alarmId: number) => {
  return useQuery({
    queryKey: ['alarm', alarmId],
    queryFn: () => getAlarmDetail(alarmId),
    enabled: !!alarmId,
  });
};

// ------------------- D-4: 알람 수정 -------------------
const updateAlarm = async ({
  alarmId,
  ...data
}: { alarmId: number } & AlarmUpdateRequest): Promise<AlarmResponse> => {
  const response = await apiClient.patch<AlarmResponse>(`/alarms/${alarmId}`, data);
  return response.data;
};

export const useUpdateAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAlarm,
    onSuccess: (data) => {
      console.log('✅ 알람 수정 성공! 알람 목록을 새로고침합니다.');
      // 상위 키를 사용하여 안정적으로 새로고침합니다.
      queryClient.invalidateQueries({ queryKey: ['alarms', 'device'] });
    },
    onError: (error) => {
      console.error('⛔ 알람 수정 실패:', error);
    }
  });
};

// ------------------- D-5: 알람 삭제 -------------------
const deleteAlarm = async (alarmId: number): Promise<void> => {
  await apiClient.delete(`/alarms/${alarmId}`);
};

export const useDeleteAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlarm,
    onSuccess: () => {
      // 삭제 후에도 동일하게 상위 키를 사용하여 무효화합니다.
      console.log('✅ 알람 삭제 성공! 알람 목록을 새로고침합니다.');
      queryClient.invalidateQueries({ queryKey: ['alarms', 'device'] });
    },
    onError: (error) => {
      console.error('⛔ 알람 삭제 실패:', error);
    },
  });
};
