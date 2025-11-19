import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  useGetDeviceDetail,
  useUpdatePowerStatus,
  useUpdateDeviceMode,
  DeviceMode,
  useUpdateDeviceMedia,
  useUpdateDeviceOpacity, // 훅 다시 추가
} from '@/api/device';
import { useGetMyMedia } from '@/api/media'; // useGetMediaDetail은 제거합니다.
import { BottomTabParamList } from '@/navigation/BottomTabNavigator';
import { COLORS } from '@/constants/color';
import { useDeviceStore } from '@/stores/deviceStore';
import Header from '@/components/common/Header';

// 1. MODE_MAP을 새로운 모드에 맞게 수정합니다.
const MODE_MAP: Record<DeviceMode, string> = {
  MENU_MODE: '메뉴 모드',
  CUSTOM_MODE: '사용자 설정',
  AUTO_MODE: '자동 모드',
  PRIVACY_MODE: '프라이버시',
  GLASS_MODE: '유리 모드',
};

// 2. MODES 배열도 순서에 맞게 수정합니다.
const MODES: DeviceMode[] = ['MENU_MODE', 'CUSTOM_MODE', 'AUTO_MODE', 'PRIVACY_MODE', 'GLASS_MODE'];

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};


type HomeScreenRouteProp = RouteProp<BottomTabParamList, 'Home'>;

function HomeScreen() {
  const route = useRoute<HomeScreenRouteProp>();
  const { deviceId } = route.params;

  // 1. 모든 훅 호출을 컴포넌트 최상단으로 이동시킵니다.
  const {
    data: deviceDetail,
    isLoading: isDeviceDetailLoading,
    error: deviceDetailError,
    refetch: refetchDeviceDetail, // useGetDeviceDetail에서 refetch 함수를 가져옵니다.
  } = useGetDeviceDetail(deviceId);
  
  const { data: myMedia } = useGetMyMedia();
  
  const { mutate: updatePower } = useUpdatePowerStatus();
  const { mutate: updateMode } = useUpdateDeviceMode();
  const { mutate: updateMedia } = useUpdateDeviceMedia();
  const { mutate: updateOpacity } = useUpdateDeviceOpacity(refetchDeviceDetail); // 훅 다시 추가
  const { openPercentage: liveOpenPercentage } = useDeviceStore(); 

  const [currentTime, setCurrentTime] = useState(new Date());

  const mediaId = deviceDetail?.mediaId;

  const currentMediaDetail = useMemo(() => {
    if (!mediaId || !myMedia) return null;
    return myMedia.find(m => m.mediaId === mediaId);
  }, [myMedia, mediaId]);

  const relatedMediaGroup = useMemo(() => {
    if (!deviceDetail?.mediaId || !myMedia) return null;

    const currentMedia = myMedia.find(m => m.mediaId === deviceDetail.mediaId);
    if (!currentMedia) return null;

    const originalMediaId = currentMedia.originType === 'ORIGINAL' 
      ? currentMedia.mediaId 
      : currentMedia.parentMediaId;
    
    if (originalMediaId === null) return null;

    const original = myMedia.find(m => m.mediaId === originalMediaId);
    const aiChildren = myMedia.filter(m => m.parentMediaId === originalMediaId);

    const objectRemoved = aiChildren.find(m => m.originType === 'AI_RP') || null;
    const sunset = aiChildren.find(m => m.originType === 'AI_SUNSET') || null;
    const dawn = aiChildren.find(m => m.originType === 'AI_DAWN') || null;
    const afternoon = aiChildren.find(m => m.originType === 'AI_AFTERNOON') || null;
    const night = aiChildren.find(m => m.originType === 'AI_NIGHT') || null;
    
    return { original, objectRemoved, sunset, dawn, afternoon, night };
  }, [deviceDetail?.mediaId, myMedia]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 * 60);

    return () => clearInterval(timer);
  }, []);
  
  // 2. 로딩 및 에러 처리는 모든 훅 호출이 끝난 후에 수행합니다.
  if (isDeviceDetailLoading) {
    return (
      <SafeAreaView style={styles.messageContainer}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
        <Text style={styles.messageText}>디바이스 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (deviceDetailError) {
    return (
      <SafeAreaView style={styles.messageContainer}>
        <Text style={styles.errorText}>오류가 발생했습니다.</Text>
        <Text style={styles.messageText}>{deviceDetailError.message}</Text>
      </SafeAreaView>
    );
  }

  if (!deviceDetail) {
    return (
       <SafeAreaView style={styles.messageContainer}>
         <Text style={styles.errorText}>디바이스 정보가 없습니다.</Text>
       </SafeAreaView>
    )
  }

  // 3. 핸들러 함수들은 훅 호출과 UI 렌더링 사이에 위치시킵니다.
  const handleTogglePower = () => {
    // deviceDetail이 null일 수 없으므로 !를 사용하거나 조건문 유지
    updatePower({ deviceId, powerStatus: !deviceDetail.powerStatus });
  };

  const handleChangeMode = () => {
    const currentIndex = MODES.indexOf(deviceDetail.modeStatus);
    const nextIndex = (currentIndex + 1) % MODES.length;
    updateMode({ deviceId, data: { mode: MODES[nextIndex] } });
  };
  
  const handleChangeMedia = (newMediaId: number | null) => {
    if (newMediaId === null || newMediaId === deviceDetail.mediaId) return;
    updateMedia({ deviceId, data: { mediaId: newMediaId } });
  };

  // 투명도 조절 핸들러 함수 추가
  const handleToggleOpacity = () => {
    if (deviceDetail) {
      const newOpacityStatus = !deviceDetail.opacityStatus;
      console.log(`🔄 투명도 상태 변경 시도:`, {
        deviceId: deviceId,
        newStatus: newOpacityStatus,
      });
      updateOpacity({
        deviceId: deviceId,
        status: newOpacityStatus,
      });
    }
  };

  // --- 이하 UI 렌더링 로직 ---
  // 디버깅용 console.log는 제거합니다.

  const hasImage = !!currentMediaDetail?.downloadUrl;

  const openStatusText =
    liveOpenPercentage !== null
      ? liveOpenPercentage === 0
        ? '닫힘'
        : `${liveOpenPercentage}%`
      : deviceDetail.openStatus
      ? '열림'
      : '닫힘';

  return (
    <SafeAreaView style={styles.container}>
      <Header title={deviceDetail.deviceName} showBackButton={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.displayContainer}>
          <ImageBackground
            source={
              hasImage
                ? { uri: currentMediaDetail.downloadUrl }
                : require('@/assets/bgimage.jpeg')
            }
            style={styles.backgroundImage}
            imageStyle={styles.imageStyle}>
            <View style={styles.overlayContent}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.controlsGrid}>
          <TouchableOpacity style={styles.controlCard} onPress={handleChangeMode}>
            <MaterialCommunityIcon name="auto-fix" size={24} color="#E0E5EB" />
            <Text style={styles.controlCardTitle}>창문 모드</Text>
            <Text style={styles.controlCardValue}>
              {MODE_MAP[deviceDetail.modeStatus] ?? '알 수 없음'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlCard} onPress={handleTogglePower}>
            <MaterialCommunityIcon name="power-plug-outline" size={24} color="#E0E5EB" />
            <Text style={styles.controlCardTitle}>전원</Text>
            <Text style={styles.controlCardValue}>
              {deviceDetail.powerStatus ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>

          <View style={styles.controlCard}>
            <MaterialCommunityIcon name="window-open-variant" size={24} color="#E0E5EB" />
            <Text style={styles.controlCardTitle}>개폐</Text>
            <Text style={styles.controlCardValue}>{openStatusText}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.controlCard,
              !deviceDetail.powerStatus && styles.disabledCard,
            ]}
            onPress={handleToggleOpacity}
            disabled={!deviceDetail.powerStatus}>
            <MaterialCommunityIcon name="sun-wireless-outline" size={24} color="#E0E5EB" />
            <Text style={styles.controlCardTitle}>투명도</Text>
            <Text style={styles.controlCardValue}>
              {deviceDetail.opacityStatus ? '투명' : '불투명'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {relatedMediaGroup && relatedMediaGroup.original && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>AI 기능</Text>
            
            <View style={styles.aiButtonRow}>
              <TouchableOpacity
                style={styles.aiButton}
                onPress={() => handleChangeMedia(relatedMediaGroup.original!.mediaId)}
              >
                <Icon name="image-outline" size={22} color="#E0E5EB" />
                <Text style={styles.aiButtonText}>원본</Text>
              </TouchableOpacity>

              {relatedMediaGroup.objectRemoved && (
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => handleChangeMedia(relatedMediaGroup.objectRemoved!.mediaId)}
                >
                  <MaterialCommunityIcon name="image-filter-hdr" size={22} color="#E0E5EB" />
                  <Text style={styles.aiButtonText}>배경만</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.subSectionTitle}>분위기 변경</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedMediaGroup.dawn && (
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => handleChangeMedia(relatedMediaGroup.dawn!.mediaId)}
                >
                  <Text style={styles.moodButtonText}>새벽</Text>
                </TouchableOpacity>
              )}
              {relatedMediaGroup.afternoon && (
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => handleChangeMedia(relatedMediaGroup.afternoon!.mediaId)}
                >
                  <Text style={styles.moodButtonText}>낮</Text>
                </TouchableOpacity>
              )}
              {relatedMediaGroup.sunset && (
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => handleChangeMedia(relatedMediaGroup.sunset!.mediaId)}
                >
                  <Text style={styles.moodButtonText}>석양</Text>
                </TouchableOpacity>
              )}
              {relatedMediaGroup.night && (
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => handleChangeMedia(relatedMediaGroup.night!.mediaId)}
                >
                  <Text style={styles.moodButtonText}>밤</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* '자동 모드 설정' 섹션은 여기에서 제거되었습니다. */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  messageContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: { marginTop: 16, color: '#E0E5EB', fontSize: 16 },
  errorText: { color: '#FB2C36', fontSize: 18, marginBottom: 8 },
  displayContainer: {
    height: 220, // 높이 살짝 증가
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24, // 간격 증가
  },
  backgroundImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageStyle: { borderRadius: 16 },
  overlayContent: { 
    position: 'absolute', 
    top: 20, 
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', // 시간 가독성 향상
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  dateText: { color: 'white', fontSize: 16, opacity: 0.9 },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  controlCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start', // 아이콘, 텍스트 왼쪽 정렬
  },
  controlCardTitle: {
    color: '#94A3B8', // 타이틀 색상 변경
    fontSize: 14,
    marginTop: 10,
  },
  controlCardValue: {
    color: '#F1F5F9', // 값 색상 변경
    fontSize: 20, // 폰트 크기 증가
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionContainer: { // aiControlsContainer 이름 변경 및 스타일 수정
    marginTop: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subSectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  aiButtonRow: {
    flexDirection: 'row',
    gap: 20,
  },
  aiButton: {
    alignItems: 'center',
    padding: 8,
  },
  aiButtonText: {
    color: '#CBD5E1',
    marginTop: 6,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  moodButton: {
    backgroundColor: '#334155',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 12,
  },
  moodButtonText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledCard: {
    opacity: 0.5,
    backgroundColor: '#334155', // 비활성화된 카드의 색상
  },
});

export default HomeScreen;
