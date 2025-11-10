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
  const response = await apiClient.get<AlarmResponse[]>(`/devices/${deviceId}/alarms`);
  return response.data;
};

export const useGetDeviceAlarms = (deviceId: number) => {
  return useQuery({
    queryKey: ['alarms', 'device', deviceId],
    queryFn: () => getDeviceAlarms(deviceId),
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
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      queryClient.invalidateQueries({ queryKey: ['alarms', 'device', data.deviceId] });
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
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      queryClient.invalidateQueries({ queryKey: ['alarms', 'device', data.deviceId] });
      queryClient.invalidateQueries({ queryKey: ['alarm', data.alarmId] });
    },
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
    onSuccess: (_, alarmId) => {
      // 삭제 후 알람 목록을 무효화
      // 특정 디바이스 알람 목록만 무효화 할 수도 있지만, 일단 전체 무효화가 간단
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      // 특정 알람 쿼리 캐시 제거
      queryClient.removeQueries({ queryKey: ['alarm', alarmId] });
    },
  });
};
