import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { MainStackParamList } from './MainNavigator';
import HomeScreen from '@/screens/home/HomeScreen';
import DisplayScreen from '@/screens/display/DisplayScreen';
import DeviceControlScreen from '@/screens/device/DeviceControlScreen';
import CustomWrapperScreen from '@/screens/custom/CustomWrapperScreen';

// 1. 아이콘 렌더링 함수들을 컴포넌트 외부로 분리합니다.
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="home-outline" color={color} size={size} />
);
const DisplayIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="tv-outline" color={color} size={size} />
);
const DeviceControlIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="hardware-chip-outline" color={color} size={size} />
);
const CustomIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="settings-outline" color={color} size={size} />
);


type BottomTabNavigatorProps = {
  route: RouteProp<MainStackParamList, 'BottomTabs'>;
};

export type BottomTabParamList = {
  Home: { deviceId: number };
  Display: { deviceId: number };
  DeviceControl: { deviceId: number };
  Custom: { deviceId: number };
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator({ route }: BottomTabNavigatorProps) {
  const { deviceId } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#60A5FA',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopWidth: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ deviceId }}
        options={{
          title: '홈',
          tabBarIcon: HomeIcon, // 2. 미리 정의된 함수를 참조로 전달합니다.
        }}
      />
      <Tab.Screen
        name="Display"
        component={DisplayScreen}
        initialParams={{ deviceId }}
        options={{
          title: '화면',
          tabBarIcon: DisplayIcon, // 2. 미리 정의된 함수를 참조로 전달합니다.
        }}
      />
      <Tab.Screen
        name="DeviceControl"
        component={DeviceControlScreen}
        initialParams={{ deviceId }}
        options={{
          title: '제어',
          tabBarIcon: DeviceControlIcon, // 2. 미리 정의된 함수를 참조로 전달합니다.
        }}
      />
      <Tab.Screen
        name="Custom"
        component={CustomWrapperScreen}
        initialParams={{ deviceId }}
        options={{
          title: '설정',
          tabBarIcon: CustomIcon, // 2. 미리 정의된 함수를 참조로 전달합니다.
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;