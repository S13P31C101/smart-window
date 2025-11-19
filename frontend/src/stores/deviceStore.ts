import { create } from 'zustand';

interface DeviceState {
  // 실시간 개폐율 (%). null은 아직 BLE 연결이 안되었거나 값을 받지 못했음을 의미
  openPercentage: number | null;
  setOpenPercentage: (percentage: number | null) => void;

  // 새로 추가: 현재 사용자가 선택한 디바이스의 ID
  selectedDeviceId: number | null;
  setSelectedDeviceId: (deviceId: number | null) => void;
}

export const useDeviceStore = create<DeviceState>(set => ({
  openPercentage: null,
  setOpenPercentage: percentage => set({ openPercentage: percentage }),
  
  // 새로 추가
  selectedDeviceId: null,
  setSelectedDeviceId: deviceId => set({ selectedDeviceId: deviceId }),
}));
