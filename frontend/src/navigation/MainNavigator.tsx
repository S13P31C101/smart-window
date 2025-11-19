import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from '@/screens/main/MainScreen';
import DeviceRegisterScreen from '@/screens/main/DeviceRegisterScreen';
import BottomTabNavigator from './BottomTabNavigator';
import MyPageScreen from '@/screens/mypage/MyPageScreen'; // MyPageScreen import는 유지합니다.

// MyPage를 스택 리스트에 추가합니다.
export type MainStackParamList = {
  Main: undefined;
  DeviceRegister: undefined;
  BottomTabs: { deviceId: number };
  MyPage: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

function MainNavigator() {
  return (
    // 네비게이터의 기본 헤더는 사용하지 않도록 설정합니다.
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="DeviceRegister" component={DeviceRegisterScreen} />
      <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      <Stack.Screen name="MyPage" component={MyPageScreen} />
    </Stack.Navigator>
  );
}

export default MainNavigator;