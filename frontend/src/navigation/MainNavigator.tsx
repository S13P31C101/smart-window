import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from '@/screens/MainScreen';
import HomeScreen from '@/screens/home/HomeScreen';
import DeviceControlScreen from '@/screens/device/DeviceControlScreen'; // 1. 제어 화면 import

export type MainStackParamList = {
  Main: undefined;
  Home: { deviceId: string; deviceName: string };
  DeviceControl: { deviceId: string }; // 2. 제어 화면 타입 추가
};

const Stack = createNativeStackNavigator<MainStackParamList>();

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      {/* 3. 제어 화면을 스택에 추가 */}
      <Stack.Screen
        name="DeviceControl"
        component={DeviceControlScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default MainNavigator;