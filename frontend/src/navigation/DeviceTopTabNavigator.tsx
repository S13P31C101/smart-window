import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BrightnessScreen from '@/screens/device/tabs/BrightnessScreen';
import TransparencyScreen from '@/screens/device/tabs/TransparencyScreen';
import OpenCloseScreen from '@/screens/device/tabs/OpenCloseScreen';

const Tab = createMaterialTopTabNavigator();

function DeviceTopTabNavigator() {
  return (
    <Tab.Navigator
      // lazy 옵션을 true로 설정하여 비활성 탭이 렌더링되지 않도록 합니다.
      lazy={true}
      screenOptions={{
        swipeEnabled: false,
        // animationEnabled: false, // 이 줄은 제거하여 탭 전환 애니메이션을 다시 활성화합니다.
        tabBarStyle: {
          backgroundColor: '#0F172A', // 배경색
          elevation: 0, // 안드로이드 그림자 제거
          shadowOpacity: 0, // iOS 그림자 제거
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#FFFFFF', // 활성 탭 색상
        tabBarInactiveTintColor: '#94A3B8', // 비활성 탭 색상
        tabBarIndicatorStyle: {
          backgroundColor: '#FFFFFF', // 하단 인디케이터 색상
          height: 3,
        },
      }}>
      <Tab.Screen name="밝기" component={BrightnessScreen} />
      <Tab.Screen name="투명도" component={TransparencyScreen} />
      <Tab.Screen name="개폐" component={OpenCloseScreen} />
    </Tab.Navigator>
  );
}

export default DeviceTopTabNavigator;
