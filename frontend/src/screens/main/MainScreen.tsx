import React, { useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { COLORS } from '@/constants/color';
import { useGetDevices } from '@/api/device'; // 1. API 훅 import
import { useDeviceStore } from '@/stores/deviceStore'; // 스토어 import 추가

// 2. 스마트 창문을 제외한 나머지 목업 데이터를 정의합니다.
const mockOtherDevices = [
  { id: '1', name: '공기청정기', status: '등록됨', icon: 'air-purifier', isSmartWindow: false },
  { id: '2', name: '냉장고', status: '등록됨', icon: 'fridge-outline', isSmartWindow: false },
  { id: '3', name: '세탁기', status: '사용할 수 없음', icon: 'washing-machine', isSmartWindow: false },
  { id: '4', name: '에어컨', status: '등록됨', icon: 'air-conditioner', isSmartWindow: false },
];

const { width } = Dimensions.get('window');
const cardWidth = (width - 24 * 2 - 16) / 2;

// 3. 화면에 표시될 기기 데이터 타입을 정의합니다.
type DisplayDevice = {
  id: string;
  numericId?: number;
  name: string;
  status: string;
  icon: string;
  isSmartWindow: boolean;
};

type MainScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Main'>;

function MainScreen() {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const setSelectedDeviceId = useDeviceStore(state => state.setSelectedDeviceId); // 스토어 함수 가져오기

  // 4. 스마트 창문 API를 호출합니다.
  const { data: smartWindows, isLoading, error } = useGetDevices();

  // 5. API 데이터와 목업 데이터를 합칩니다.
  const displayDevices = useMemo(() => {
    // 5. API 데이터와 목업 데이터를 합칩니다.
    const mappedSmartWindows: DisplayDevice[] = Array.isArray(smartWindows) // smartWindows가 실제 배열인지 확인합니다.
      ? smartWindows.map(sw => ({
          id: sw.deviceId.toString(),
          numericId: sw.deviceId,
          name: sw.deviceName,
          status: '등록됨',
          icon: 'window-closed-variant',
          isSmartWindow: true,
        }))
      : []; // 배열이 아닐 경우, 빈 배열을 사용합니다.

    return [...mappedSmartWindows, ...mockOtherDevices];
  }, [smartWindows]);

  const handleCardPress = (item: DisplayDevice) => {
    // 6. 스마트 창문일 경우에만 BottomTabs로 이동합니다.
    if (item.isSmartWindow && item.numericId) {
      setSelectedDeviceId(item.numericId); // 전역 스토어에 ID 저장
      navigation.navigate('BottomTabs', { deviceId: item.numericId });
    } else {
      console.log(`'${item.name}' 카드를 클릭했습니다.`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.messageContainer}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.messageContainer}>
        <Text style={styles.errorText}>기기 목록을 불러올 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>모든 기기</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('DeviceRegister')}>
            <Icon name="add" size={28} color={COLORS.iconPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={displayDevices} // 7. 합쳐진 데이터를 FlatList에 전달합니다.
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { width: cardWidth }]}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcon name={item.icon} size={30} color={COLORS.iconCard} />
            </View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={[styles.cardStatus, item.status !== '등록됨' && styles.cardStatusDisabled]}>
              {item.status}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, },
  messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  errorText: { color: COLORS.notification, fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, },
  headerLeft: { flexDirection: 'row', alignItems: 'center', },
  headerRight: { flexDirection: 'row', alignItems: 'center', },
  headerIcon: { padding: 8, },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginLeft: 8, },
  gridContainer: { paddingHorizontal: 24, },
  row: { justifyContent: 'space-between', },
  card: { backgroundColor: COLORS.surfaceCardDark, borderRadius: 20, padding: 16, marginBottom: 16, },
  iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.surfaceIcon, justifyContent: 'center', alignItems: 'center', marginBottom: 24, },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4, },
  cardStatus: { fontSize: 14, color: COLORS.textSecondary, },
  cardStatusDisabled: { color: COLORS.textDisabled, },
});

export default MainScreen;
