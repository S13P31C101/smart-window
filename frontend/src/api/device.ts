import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';

// backend의 DeviceMode Enum에 해당
export type DeviceMode = 'AUTO_MODE' | 'DARK_MODE' | 'SLEEP_MODE' | 'CUSTOM_MODE';

// C-1, C-3: 장치 상세 정보 응답 DTO
export interface DeviceDetailResponse {
  deviceId: number;
  deviceUniqueId: string;
  deviceName: string;
  powerStatus: boolean;
  openStatus: boolean;
  modeStatus: DeviceMode;
  modeSettings: Record<string, any>; // Map<String, Object> -> Record<string, any>
  mediaId: number | null;
  createdAt: string;
}

// C-2: 장치 등록 요청 DTO
export interface DeviceRegisterRequest {
  deviceUniqueId: string;
  deviceName: string;
}

// C-4: 장치 이름 수정 요청 DTO (PATCH /devices/{device-id})
export interface DeviceUpdateNameRequest {
  deviceName: string;
}

// C-6, C-8: 장치 상태(전원, 개폐) 조회 응답 DTO
export interface DeviceStatusResponse {
  deviceId: number;
  status: boolean;
}

// C-7, C-9: 장치 상태(전원, 개폐) 변경 요청 DTO
export interface DeviceStatusRequest {
  status: boolean;
}

// C-10: 장치 모드 변경 요청 DTO
export interface DeviceModeStatusRequest {
  mode: DeviceMode;
}

// C-10: 장치 모드 변경 응답 DTO
export interface DeviceModeStatusResponse {
  deviceId: number;
  modeStatus: DeviceMode;
}

// C-11: 장치 모드 설정 요청 DTO
export interface DeviceModeSettingsRequest {
  settings: Record<string, any>;
}

// C-11: 장치 모드 설정 응답 DTO
export interface DeviceModeSettingsResponse {
  deviceId: number;
  modeSettings: Record<string, any>;
}

// C-12: 장치 미디어 변경 요청 DTO
export interface DeviceMediaUpdateRequest {
  mediaId: number;
}

// ============================================================================
// API 함수 및 커스텀 훅
// ============================================================================

// ------------------- C-1: 내 창문 목록 조회 -------------------
const getDevices = async (): Promise<DeviceDetailResponse[]> => {
  const response = await apiClient.get<DeviceDetailResponse[]>('/devices');
  return response.data;
};

export const useGetDevices = () => {
  return useQuery({ queryKey: ['devices'], queryFn: getDevices });
};

// ------------------- C-2: 내 창문 등록 -------------------
const registerDevice = async (
  data: DeviceRegisterRequest,
): Promise<DeviceDetailResponse> => {
  const response = await apiClient.post<DeviceDetailResponse>('/devices', data);
  return response.data;
};

export const useRegisterDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });
};

// ------------------- C-3: 내 창문 정보 조회 -------------------
const getDeviceDetail = async (deviceId: number): Promise<DeviceDetailResponse> => {
  const response = await apiClient.get<DeviceDetailResponse>(`/devices/${deviceId}`);
  return response.data;
};

export const useGetDeviceDetail = (deviceId: number) => {
  return useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => getDeviceDetail(deviceId),
    enabled: !!deviceId,
  });
};

// ------------------- C-4: 내 창문 정보 수정 (이름) -------------------
const updateDeviceName = async ({
  deviceId,
  ...data
}: { deviceId: number } & DeviceUpdateNameRequest): Promise<DeviceDetailResponse> => {
  const response = await apiClient.patch<DeviceDetailResponse>(`/devices/${deviceId}`, data);
  return response.data;
};

export const useUpdateDeviceName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDeviceName,
    onSuccess: (_, { deviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', deviceId] });
    },
  });
};

// ------------------- C-5: 내 창문 삭제 -------------------
const deleteDevice = async (deviceId: number): Promise<void> => {
  await apiClient.delete(`/devices/${deviceId}`);
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });
};

// ------------------- C-7: 내 창문 전원 상태 변경 -------------------
const updatePowerStatus = async ({
  deviceId,
  ...data
}: { deviceId: number } & DeviceStatusRequest): Promise<DeviceStatusResponse> => {
  const response = await apiClient.put<DeviceStatusResponse>(`/devices/${deviceId}/power`, data);
  return response.data;
};

export const useUpdatePowerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePowerStatus,
    onSuccess: (_, { deviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['device', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

// ------------------- C-9: 내 창문 개폐 상태 변경 -------------------
const updateOpenStatus = async ({
  deviceId,
  ...data
}: { deviceId: number } & DeviceStatusRequest): Promise<DeviceStatusResponse> => {
  const response = await apiClient.put<DeviceStatusResponse>(`/devices/${deviceId}/open`, data);
  return response.data;
};

export const useUpdateOpenStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOpenStatus,
    onSuccess: (_, { deviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['device', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

// ------------------- C-10: 내 창문 모드 변경 -------------------
const updateDeviceMode = async ({
  deviceId,
  ...data
}: { deviceId: number } & DeviceModeStatusRequest): Promise<DeviceModeStatusResponse> => {
  const response = await apiClient.put<DeviceModeStatusResponse>(
    `/devices/${deviceId}/mode/status`,
    data,
  );
  return response.data;
};

export const useUpdateDeviceMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDeviceMode,
    onSuccess: (_, { deviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['device', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

// ------------------- C-11: 내 창문 모드 설정 -------------------
const updateDeviceModeSettings = async ({
  deviceId,
  ...data
}: { deviceId: number } & DeviceModeSettingsRequest): Promise<DeviceModeSettingsResponse> => {
  const response = await apiClient.put<DeviceModeSettingsResponse>(
    `/devices/${deviceId}/mode/settings`,
    data,
  );
  return response.data;
};

export const useUpdateDeviceModeSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDeviceModeSettings,
    onSuccess: (_, { deviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['device', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

// ------------------- C-12: 내 창문 미디어 변경 -------------------
const updateDeviceMedia = async ({
  deviceId,
  ...data
}: { deviceId: number } & DeviceMediaUpdateRequest): Promise<DeviceDetailResponse> => {
  const response = await apiClient.put<DeviceDetailResponse>(
    `/devices/${deviceId}/media`,
    data,
  );
  return response.data;
};

export const useUpdateDeviceMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDeviceMedia,
    onSuccess: (_, { deviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['device', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};
