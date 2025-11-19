import React from 'react';
import { StyleSheet, Text, View, Switch, ImageBackground, ActivityIndicator } from 'react-native';
import { useDeviceStore } from '@/stores/deviceStore';
import { useGetDeviceDetail, useUpdateDeviceOpacity } from '@/api/device';

function TransparencyScreen() {
  const selectedDeviceId = useDeviceStore(state => state.selectedDeviceId);
  const { data: deviceDetail, isLoading } = useGetDeviceDetail(selectedDeviceId);
  const { mutate: updateOpacity, isPending } = useUpdateDeviceOpacity();

  const handleToggleTransparency = () => {
    if (deviceDetail) {
      updateOpacity({
        deviceId: deviceDetail.deviceId,
        status: !deviceDetail.opacityStatus,
      });
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loadingContainer} size="large" color="white" />;
  }

  if (!deviceDetail) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.statusText}>디바이스 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  // opacityStatus가 true이면 '불투명', false이면 '투명'
  const isTransparent = !deviceDetail.opacityStatus;

  return (
    <ImageBackground
      source={require('@/assets/bgimage.jpeg')}
      style={styles.container}
      blurRadius={isTransparent ? 0 : 15}
    >
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isTransparent ? '선명한 창' : '흐릿한 창'}
        </Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <Text style={styles.controlTitle}>창문 투명도</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {isTransparent ? '투명' : '불투명'}
          </Text>
          <Switch
            onValueChange={handleToggleTransparency}
            value={isTransparent}
            disabled={isPending || !deviceDetail.powerStatus} // API 요청 중이거나 전원이 꺼져있으면 비활성화
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isTransparent ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B', // 배경색 추가
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  controlsContainer: {
    // 하단 컨트롤은 여기에 위치
  },
  controlTitle: {
    color: '#E0E5EB',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0E5EB',
    marginHorizontal: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
});

export default TransparencyScreen;
