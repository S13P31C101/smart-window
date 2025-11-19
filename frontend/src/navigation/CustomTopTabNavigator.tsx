import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// 말씀해주신 4개의 올바른 스크린을 import 합니다.
import CustomScreen from '../screens/custom/tabs/CustomScreen';
import AlarmScreen from '../screens/custom/tabs/AlarmScreen';
import SensorScreen from '../screens/custom/tabs/SensorScreen';
import WidgetScreen from '../screens/custom/tabs/WidgetScreen';


const Tab = createMaterialTopTabNavigator();

const CustomTopTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
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
      }}
    >
      <Tab.Screen name="커스텀" component={CustomScreen} />
      <Tab.Screen name="알람" component={AlarmScreen} />
      <Tab.Screen name="센서" component={SensorScreen} />
      <Tab.Screen name="위젯" component={WidgetScreen} />
    </Tab.Navigator>
  );
};

export default CustomTopTabNavigator;