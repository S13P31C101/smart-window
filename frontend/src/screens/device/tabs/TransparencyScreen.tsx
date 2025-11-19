import React from 'react';
import { StyleSheet, Text, View, Switch, ImageBackground, ActivityIndicator } from 'react-native';
import { useDeviceStore } from '@/stores/deviceStore';
import { useGetDeviceDetail, useUpdateDeviceOpacity } from '@/api/device';

function TransparencyScreen() {
  const selectedDeviceId = useDeviceStore(state => state.selectedDeviceId);
  const {
    data: deviceDetail,
    isLoading,
    refetch: refetchDeviceDetail, // Get the refetch function
  } = useGetDeviceDetail(selectedDeviceId);

  // Pass the refetch function as the callback
  const { mutate: updateOpacity, isPending } = useUpdateDeviceOpacity(refetchDeviceDetail);

  const handleToggleTransparency = () => {
    if (deviceDetail) {
      updateOpacity({
        deviceId: deviceDetail.deviceId,
        status: !deviceDetail.opacityStatus,
      });
    }
  };

  if (isLoading || !deviceDetail) {
    return <ActivityIndicator style={styles.loadingContainer} size="large" color="white" />;
  }

  // 'isTransparent' should directly reflect 'opacityStatus'
  const isTransparent = deviceDetail.opacityStatus;

  return (
    <ImageBackground
      source={require('@/assets/bgimage.jpeg')}
      style={styles.container}
      blurRadius={isTransparent ? 0 : 15}
    >
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isTransparent ? '투명 모드' : '불투명 모드'}
        </Text>
        <Text style={styles.description}>
          {isTransparent
            ? '창문이 투명하게 보입니다.'
            : '창문이 불투명하게 보입니다.'}
        </Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <Text style={styles.controlTitle}>창문 투명도</Text>
        <View style={styles.switchContainer}>
          <Switch
            onValueChange={handleToggleTransparency}
            value={isTransparent}
            disabled={isPending || !deviceDetail.powerStatus}
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
    alignItems: 'center', // 컨트롤들을 중앙 정렬합니다.
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
  switchContainer: {
    marginTop: 20,
    transform: [{ scale: 1.5 }], // 토글 스위치를 더 크게 만듭니다.
  },
  description: {
    color: '#E0E5EB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
});

export default TransparencyScreen;
