import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainNavigator from './MainNavigator'; // '홈' 탭에서 사용할 스택 네비게이터
import DeviceControlScreen from '@/screens/device/DeviceControlScreen'; // 1. 제어 화면 import
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, View, StyleSheet } from 'react-native'; // 1. StyleSheet import 추가
import { RouteProp, getFocusedRouteNameFromRoute } from '@react-navigation/native'; // 1. RouteProp 타입을 import 합니다.
import DisplayScreen from '@/screens/display/DisplayScreen'; // 새로 만든 스크린 import
import CustomWrapperScreen from '@/screens/custom/CustomWrapperScreen'; // 새로 만든 스크린 import

// 2. 탭 네비게이터가 관리할 화면 목록과 파라미터 타입을 정의합니다.
export type BottomTabParamList = {
  홈: undefined;
  제어: undefined;
  화면: undefined;
  커스텀: undefined;
};

// 3. PlaceholderScreen이 받을 props의 타입을 정의합니다.
type PlaceholderScreenProps = {
  route: RouteProp<BottomTabParamList>;
};

// --- 임시 스크린 컴포넌트들 ---
// 4. 컴포넌트의 props에 타입을 적용합니다.
const PlaceholderScreen = ({ route }: PlaceholderScreenProps) => (
  // 2. styles.placeholderContainer 적용
  <View style={styles.placeholderContainer}> 
    <Text style={styles.placeholderText}>{route.name} Screen</Text>
  </View>
);

// --- 1. 아이콘 컴포넌트들을 외부로 분리 ---
type TabBarIconProps = { focused: boolean; color: string; size: number };

const HomeIcon = ({ focused, color }: TabBarIconProps) => (
  <Icon name={focused ? 'home' : 'home-outline'} size={24} color={color} />
);
const DeviceIcon = ({ color }: TabBarIconProps) => (
  <MaterialCommunityIcon name="lightbulb-on-outline" size={24} color={color} />
);
const ScreenIcon = ({ focused, color }: TabBarIconProps) => (
  <Icon name={focused ? 'image' : 'image-outline'} size={24} color={color} />
);
const SettingsIcon = ({ focused, color }: TabBarIconProps) => (
  <Icon name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
);

// 5. 네비게이터 생성 시 타입을 적용합니다.
const Tab = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator() {
  const ACTIVE_COLOR = '#60A5FA'; // 활성 탭 색상
  const INACTIVE_COLOR = '#94A3B8'; // 비활성 탭 색상

  // 1. 재사용할 탭 바 스타일을 상수로 정의
  const tabBarStyle = {
    backgroundColor: '#1E293B',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 5,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}>
      <Tab.Screen
        name="홈"
        component={MainNavigator}
        options={({ route }) => {
          // 2. 현재 활성화된 화면 이름을 가져옴
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Main';
          // 1. 'Main' 화면일 경우에만 탭 바를 숨기도록 조건을 반대로 변경
          const isTabBarVisible = routeName === 'Main';
          
          return {
            tabBarStyle: isTabBarVisible ? { display: 'none' } : tabBarStyle,
            tabBarIcon: HomeIcon,
          };
        }}
      />
      <Tab.Screen
        name="제어"
        component={DeviceControlScreen}
        options={{
          tabBarIcon: DeviceIcon,
          tabBarStyle: tabBarStyle,
          headerShown: false, // 헤더 숨김
        }}
      />
      <Tab.Screen
        name="화면"
        component={DisplayScreen} // 래퍼 스크린으로 교체
        options={{
          tabBarIcon: ScreenIcon,
          tabBarStyle: tabBarStyle,
          headerShown: false, // 헤더 숨김
        }}
      />
      <Tab.Screen
        name="커스텀"
        component={CustomWrapperScreen} // 래퍼 스크린으로 교체
        options={{
          tabBarIcon: SettingsIcon,
          tabBarStyle: tabBarStyle,
          headerShown: false, // 헤더 숨김
        }}
      />
    </Tab.Navigator>
  );
}

// 3. 스타일 객체 생성
const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  placeholderText: {
    color: 'white',
    fontSize: 24,
  },
});

export default BottomTabNavigator;