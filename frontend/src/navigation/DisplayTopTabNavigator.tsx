import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ImageUploadScreen from '@/screens/display/tabs/ImageUploadScreen';
import StorageScreen from '@/screens/display/tabs/StorageScreen';
import MusicScreen from '@/screens/display/tabs/MusicScreen';
import { COLORS } from '@/constants/color';

const Tab = createMaterialTopTabNavigator();

function DisplayTopTabNavigator() {
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
      <Tab.Screen name="이미지" component={ImageUploadScreen} />
      <Tab.Screen name="보관" component={StorageScreen} />
      <Tab.Screen name="음악" component={MusicScreen} />
    </Tab.Navigator>
  );
}

export default DisplayTopTabNavigator;
