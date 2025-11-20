import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';

// 1. 백엔드 공통 응답 타입을 정의합니다.
export interface BackendResponse<T> {
  status: number;
  data: T;
}

/* ----------------- DTO ----------------- */
// backend의 DeviceMode Enum에 해당
export type DeviceMode = 'MENU_MODE' | 'CUSTOM_MODE' | 'AUTO_MODE' | 'PRIVACY_MODE' | 'GLASS_MODE';

// C-1, C-3: 장치 상세 정보 응답 DTO
export interface DeviceDetailResponse {
  deviceId: number;
  deviceName: string;
  deviceUniqueId: string;
  powerStatus: boolean;
  openStatus: boolean; // 타입을 number에서 boolean으로 수정합니다.
  opacityStatus: boolean; // 'transparency'를 'opacityStatus'로 수정합니다.
  modeStatus: DeviceMode;
  modeSettings: Record<string, any>; // Map<String, Object> -> Record<string, any>
  mediaId: number | null;
  musicId: number | null;
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

// 신규: 장치 음악 변경 요청 DTO
export interface DeviceMusicUpdateRequest {
  musicId: number;
}

// 새로운 요청 타입을 정의합니다.
export interface UpdateDeviceMusicRequest {
  musicId: number | null;
}

/* ----------------- API ----------------- */
// ------------------- R-1: 내 창문 목록 조회 -------------------
const getDevices = async (): Promise<DeviceDetailResponse[]> => {
  // 2. 응답 타입을 BackendResponse로 감싸고, 실제 데이터는 response.data.data에서 추출합니다.
  const response = await apiClient.get<BackendResponse<DeviceDetailResponse[]>>('/devices');
  console.log('✅ [API RESPONSE] /devices:', JSON.stringify(response.data, null, 2));
  return response.data.data;
};

export const useGetDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
  });
};

// ------------------- R-2: 내 창문 상세 조회 -------------------
const getDeviceDetail = async (deviceId: number): Promise<DeviceDetailResponse> => {
  console.log(`🚀 [API REQUEST] GET /devices/${deviceId}`);
  const response = await apiClient.get<BackendResponse<DeviceDetailResponse>>(
    `/devices/${deviceId}`,
  );
  console.log(`✅ [API RESPONSE] GET /devices/${deviceId}:`, JSON.stringify(response.data, null, 2));
  return response.data.data;
};

export const useGetDeviceDetail = (deviceId: number | null) => {
  return useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => getDeviceDetail(deviceId!),
    enabled: !!deviceId,
  });
};

// ------------------- C-2: 내 창문 등록 -------------------
const registerDevice = async (
  data: DeviceRegisterRequest,
): Promise<DeviceDetailResponse> => {
  const response = await apiClient.post<BackendResponse<DeviceDetailResponse>>(
    '/devices',
    data,
  );
  return response.data.data;
};

export const useRegisterDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });
};

// ------------------- U-1: 전원 상태 변경 -------------------
const updatePowerStatus = async (
  deviceId: number,
  powerStatus: boolean,
): Promise<DeviceDetailResponse> => {
  const payload = { status: powerStatus };
  console.log(`🚀 [API REQUEST] PATCH /devices/${deviceId}/power`, payload);
  const response = await apiClient.patch<BackendResponse<DeviceDetailResponse>>(
    `/devices/${deviceId}/power`,
    // --- 요청 본문의 Key를 'powerStatus'에서 'status'로 수정합니다. ---
    payload,
  );
  console.log(`✅ [API RESPONSE] PATCH /devices/${deviceId}/power:`, JSON.stringify(response.data, null, 2));
  return response.data.data;
};

export const useUpdatePowerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      deviceId,
      powerStatus,
    }: {
      deviceId: number;
      powerStatus: boolean;
    }) => updatePowerStatus(deviceId, powerStatus),
    onSuccess: (_, variables) => {
      // queryClient.invalidateQueries({ queryKey: ['devices'] }); // 이 라인을 주석 처리하거나 삭제합니다.
      queryClient.invalidateQueries({ queryKey: ['device', variables.deviceId] });
    },
  });
};

// ------------------- U-2: 개폐 상태 변경 -------------------
const updateOpenStatus = async (
  deviceId: number,
  openStatus: boolean,
): Promise<DeviceDetailResponse> => {
  const response = await apiClient.patch<BackendResponse<DeviceDetailResponse>>(
    `/devices/${deviceId}/open`,
    // --- 여기도 일관성을 위해 'openStatus'에서 'status'로 수정합니다. ---
    { status: openStatus },
  );
  return response.data.data;
};

export const useUpdateOpenStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      deviceId,
      openStatus,
    }: {
      deviceId: number;
      openStatus: boolean;
    }) => updateOpenStatus(deviceId, openStatus),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', variables.deviceId] });
    },
  });
};

// ------------------- U-3: 창문 모드 변경 -------------------
const updateDeviceMode = async (
  deviceId: number,
  data: DeviceModeStatusRequest,
): Promise<DeviceModeStatusResponse> => {
  console.log(`🚀 [API REQUEST] PATCH /devices/${deviceId}/mode/status`, data);
  const response = await apiClient.patch<BackendResponse<DeviceModeStatusResponse>>(
    `/devices/${deviceId}/mode/status`,
    data,
  );
  console.log(`✅ [API RESPONSE] PATCH /devices/${deviceId}/mode/status:`, JSON.stringify(response.data, null, 2));
  return response.data.data;
};

export const useUpdateDeviceMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      deviceId,
      data,
    }: {
      deviceId: number;
      data: DeviceModeStatusRequest;
    }) => updateDeviceMode(deviceId, data),
    onSuccess: (_, variables) => {
      // queryClient.invalidateQueries({ queryKey: ['devices'] }); // 이 라인도 주석 처리하거나 삭제합니다.
      queryClient.invalidateQueries({ queryKey: ['device', variables.deviceId] });
    },
  });
};

// ------------------- 위젯 on/off 변경 -------------------
const updateDeviceModeSettings = async ({
  deviceId,
  data,
}: {
  deviceId: number;
  data: DeviceModeSettingsRequest;
}): Promise<DeviceModeSettingsResponse> => {
  console.log(
    `🚀 [API 요청] PATCH /devices/${deviceId}/mode/settings`,
    data,
  );
  const response = await apiClient.patch<BackendResponse<DeviceModeSettingsResponse>>(
    `/devices/${deviceId}/mode/settings`,
    data,
  );
  console.log(
    `✅ [API 응답] PATCH /devices/${deviceId}/mode/settings`,
    response.data,
  );
  return response.data.data;
};

export const useUpdateDeviceModeSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDeviceModeSettings,
    onSuccess: (data, variables) => {
      console.log('✅ 위젯 설정 변경 성공:', data);
      // 성공 시 디바이스 상세 정보 쿼리를 무효화하여 최신 상태로 업데이트
      queryClient.invalidateQueries({
        queryKey: ['deviceDetail', variables.deviceId],
      });
    },
    onError: err => {
      console.error('❌ 위젯 설정 변경 실패:', err);
    },
  });
};

// ------------------- U-5: 미디어 변경 -------------------
const updateDeviceMedia = async (
  deviceId: number,
  data: DeviceMediaUpdateRequest,
): Promise<DeviceDetailResponse> => {
  const response = await apiClient.patch<BackendResponse<DeviceDetailResponse>>(
    `/devices/${deviceId}/media`,
    data,
  );
  return response.data.data;
};

export const useUpdateDeviceMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      deviceId,
      data,
    }: {
      deviceId: number;
      data: DeviceMediaUpdateRequest;
    }) => updateDeviceMedia(deviceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['device', variables.deviceId] });
    },
  });
};

// ------------------- 장치 음악 상태 수정 (신규) -------------------
const updateDeviceMusic = async ({
  deviceId,
  data,
}: {
  deviceId: number;
  data: UpdateDeviceMusicRequest;
}): Promise<DeviceDetailResponse> => {
  console.log(`🚀 [장치 음악 수정 요청] PATCH /devices/${deviceId}/music`, data);
  // @PutMapping에서 @PatchMapping으로 변경되었으므로 apiClient.patch를 사용합니다.
  const response = await apiClient.patch<BackendResponse<DeviceDetailResponse>>(`/devices/${deviceId}/music`, data);
  console.log(`✅ [장치 음악 수정 응답] /devices/${deviceId}/music`, response.data);
  return response.data.data;
};

export const useUpdateDeviceMusic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDeviceMusic,

    // "낙관적 업데이트" 로직 시작
    onMutate: async newDeviceState => {
      // 1. 진행 중인 'devices' 쿼리를 취소하여 덮어쓰기를 방지합니다.
      await queryClient.cancelQueries({ queryKey: ['devices'] });

      // 2. 이전 장치 목록 데이터를 저장해 둡니다 (롤백 대비).
      const previousDevices = queryClient.getQueryData<DeviceDetailResponse[]>(['devices']);

      // 3. UI를 즉시 업데이트합니다.
      if (previousDevices) {
        const updatedDevices = previousDevices.map(device =>
          device.deviceId === newDeviceState.deviceId
            ? { ...device, musicId: newDeviceState.data.musicId }
            : device,
        );
        queryClient.setQueryData(['devices'], updatedDevices);
      }

      // 4. 이전 데이터를 context에 저장하여 onError에서 사용합니다.
      return { previousDevices };
    },

    // 에러 발생 시, 저장해 둔 이전 데이터로 UI를 되돌립니다.
    onError: (err, newDeviceState, context) => {
      console.error('❌ 장치 음악 상태 업데이트 실패:', err);
      if (context?.previousDevices) {
        queryClient.setQueryData(['devices'], context.previousDevices);
      }
    },

    // 성공/실패 여부와 관계없이, 마지막에는 항상 서버 데이터와 동기화합니다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

// ------------------- D-12: 디바이스 투명도 상태 변경 -------------------
const updateDeviceOpacity = async ({
  deviceId,
  status,
}: {
  deviceId: number;
  status: boolean;
}) => {
  console.log(`🚀 [API 요청] PATCH /devices/${deviceId}/opacity`, { status });
  const response = await apiClient.patch(
    `/devices/${deviceId}/opacity`, // "opcaity" -> "opacity" 경로 수정
    { status },
  );
  console.log(`✅ [API 응답] PATCH /devices/${deviceId}/opacity`, response.data);
  return response.data.data;
};

export const useUpdateDeviceOpacity = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDeviceOpacity,
    onSuccess: (data, variables) => {
      console.log('✅ 투명도 상태 업데이트 성공:', data);
      queryClient.invalidateQueries({ queryKey: ['deviceDetail', variables.deviceId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      onSuccessCallback?.(); // HomeScreen에서 전달받은 콜백 함수를 실행
    },
    onError: err => {
      console.error('❌ 디바이스 투명도 상태 업데이트 실패:', err);
    },
  });
};

// ------------------- D-1: 등록된 창문 삭제 -------------------
const deleteDevice = async (deviceId: number): Promise<void> => {
  await apiClient.delete(`/devices/${deviceId}`);
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};
