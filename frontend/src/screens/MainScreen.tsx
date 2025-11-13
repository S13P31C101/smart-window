import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/constants/color';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// 1. MainNavigator에서 정의한 ParamList 타입을 import
import { MainStackParamList } from '@/navigation/MainNavigator';

const mockDevices = [
  { id: 'smart-window', name: '스마트 창문', status: '등록됨', icon: 'window-closed-variant' },
  { id: '1', name: '공기청정기', status: '등록됨', icon: 'air-purifier' },
  { id: '2', name: '냉장고', status: '등록됨', icon: 'fridge-outline' },
  { id: '3', name: '세탁기', status: '사용할 수 없음', icon: 'washing-machine' },
  { id: '4', name: '에어컨', status: '등록됨', icon: 'air-conditioner' },
];

const TABS = ['모든 기기', '거실', '개인 기기'];

const { width } = Dimensions.get('window');
const cardWidth = (width - 24 * 2 - 16) / 2;

type Device = (typeof mockDevices)[0];

// 2. 네비게이션 Prop 타입을 MainStackParamList와 연결
type MainScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Main'>;

const DeviceCard = ({ item }: { item: Device }) => {
  // 3. useNavigation 훅에 타입 적용
  const navigation = useNavigation<MainScreenNavigationProp>();

  const handlePress = () => {
    if (item.id === 'smart-window') {
      // 1. 목적지를 'DeviceControl'에서 'Home'으로 다시 변경합니다.
      navigation.navigate('Home', { deviceId: item.id, deviceName: item.name });
    } else {
      console.log(`'${item.name}' 카드를 클릭했습니다.`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={handlePress}
      activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcon name={item.icon} size={30} color={COLORS.iconCard} />
      </View>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text
        style={[
          styles.cardStatus,
          item.status !== '등록됨' && styles.cardStatusDisabled,
        ]}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );
};

function MainScreen() {
  const [activeTab, setActiveTab] = useState('모든 기기');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 3. 헤더 및 탭 메뉴 원상 복구 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialCommunityIcon name="view-grid" size={24} color={COLORS.iconPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>우리 집</Text>
          <Icon name="chevron-down" size={20} color={COLORS.iconPrimary} />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="add" size={28} color={COLORS.iconPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="ellipsis-vertical" size={24} color={COLORS.iconPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity>
          <Icon name="search" size={24} color={COLORS.iconPrimary} />
        </TouchableOpacity>
        <View style={styles.tabs}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList<Device>
        data={mockDevices}
        renderItem={({ item }: { item: Device }) => <DeviceCard item={item} />}
        keyExtractor={(item: Device) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 16,
    marginRight: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  tabs: {
    flexDirection: 'row',
    marginLeft: 16,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeTabText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  activeTabIndicator: {
    height: 2,
    backgroundColor: COLORS.activeIndicator,
    marginHorizontal: 16,
  },
  gridContainer: {
    paddingHorizontal: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: COLORS.surfaceCardDark,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceIcon,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textCardTitle,
    marginBottom: 4,
  },
  cardStatus: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardStatusDisabled: {
    color: COLORS.textDisabled,
  },
});


export default MainScreen;
