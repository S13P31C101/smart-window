import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDeviceStore } from '@/stores/deviceStore';
import { useGetDeviceDetail, useUpdateDeviceModeSettings } from '@/api/device';

// 위젯 데이터 타입을 백엔드 DTO 필드명과 일치시킵니다.
type Widget = {
  key: keyof WidgetSettings; // 'widgetClock', 'widgetWeather' 등
  name: string;
  icon: string;
  isEnabled: boolean;
};

// 백엔드 modeSettings의 타입
interface WidgetSettings {
  widgetClock: boolean;
  widgetWeather: boolean;
  widgetQuotes: boolean;
  widgetMusic: boolean;
}

// 위젯의 메타데이터 (한글 이름, 아이콘 등)
const WIDGET_META = {
  widgetClock: { name: '시계', icon: 'time-outline' },
  widgetWeather: { name: '날씨', icon: 'partly-sunny-outline' },
  widgetQuotes: { name: '명언', icon: 'chatbox-ellipses-outline' },
  widgetMusic: { name: '음악', icon: 'musical-notes-outline' },
};


const WidgetScreen = () => {
  const selectedDeviceId = useDeviceStore(state => state.selectedDeviceId);
  const { data: deviceDetail, isLoading: isDeviceLoading } = useGetDeviceDetail(selectedDeviceId);
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateDeviceModeSettings();

  // API에서 받아온 위젯 설정
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings | null>(null);

  useEffect(() => {
    if (deviceDetail?.modeSettings) {
      setWidgetSettings({
        widgetClock: deviceDetail.modeSettings.widgetClock ?? false,
        widgetWeather: deviceDetail.modeSettings.widgetWeather ?? false,
        widgetQuotes: deviceDetail.modeSettings.widgetQuotes ?? false,
        widgetMusic: deviceDetail.modeSettings.widgetMusic ?? false,
      });
    }
  }, [deviceDetail, isDeviceLoading]);

  const toggleSwitch = (widgetKey: keyof WidgetSettings) => {
    if (!selectedDeviceId || !widgetSettings) {
      console.warn('⚠️ 위젯 설정 변경 불가: deviceId 또는 widgetSettings 없음');
      return;
    }

    const newSettings = {
      ...widgetSettings,
      [widgetKey]: !widgetSettings[widgetKey],
    };

    // UI 즉시 업데이트 (낙관적 업데이트)
    setWidgetSettings(newSettings);
    
    console.log(`🔄 위젯 상태 변경 시도:`, {
      deviceId: selectedDeviceId,
      settings: newSettings,
    });

    updateSettings(
      {
        deviceId: selectedDeviceId,
        data: newSettings, // ✅ { settings: newSettings } 가 아니라 newSettings를 바로 전달
      },
      {
        onError: err => {
          console.error('❌ 위젯 설정 변경 실패:', err);
          Alert.alert('오류', '설정 변경에 실패했습니다.');
          // 에러 시 원래 상태로 복구
          setWidgetSettings(widgetSettings);
        },
        onSuccess: data => {
          console.log('✅ 위젯 설정 변경 성공:', data);
        },
      },
    );
  };

  const renderItem = ({ item }: { item: Widget }) => (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={24} color="#94A3B8" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{item.name}</Text>
      </View>
      <Switch
        trackColor={{ false: '#3E3E3E', true: '#81b0ff' }}
        thumbColor={item.isEnabled ? '#3B82F6' : '#f4f3f4'}
        onValueChange={() => toggleSwitch(item.key)}
        value={item.isEnabled}
        disabled={isUpdating}
      />
    </View>
  );

  if (isDeviceLoading || !widgetSettings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }
  
  // FlatList에 전달할 데이터 배열로 변환
  const widgetDataForList: Widget[] = Object.keys(widgetSettings).map(key => ({
    key: key as keyof WidgetSettings,
    name: WIDGET_META[key as keyof WidgetSettings]?.name || key,
    icon: WIDGET_META[key as keyof WidgetSettings]?.icon || 'help-circle-outline',
    isEnabled: widgetSettings[key as keyof WidgetSettings],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>디스플레이 위젯</Text>
        <Text style={styles.headerDescription}>스마트 윈도우에 표시할 위젯을 선택하세요</Text>
      </View>
      <FlatList
        data={widgetDataForList}
        renderItem={renderItem}
        keyExtractor={(item: Widget) => item.key}
        contentContainerStyle={styles.listContent}
      />
      {/* '위젯 추가' 버튼은 현재 백엔드 기능이 없으므로 우선 제거합니다. */}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A',
  },
  headerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    marginBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 5,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  itemContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WidgetScreen;