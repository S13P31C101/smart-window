import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomTopTabNavigator from '../../navigation/CustomTopTabNavigator';
import Header from '../../components/common/Header'; // Header 컴포넌트를 import 합니다.

const CustomWrapperScreen = () => {
  return (
    <View style={styles.container}>
      {/* "커스텀" 이라는 제목으로 Header를 추가합니다. */}
      <Header title="커스텀" />
      <CustomTopTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // 다른 화면과 배경색을 통일합니다.
  },
});

export default CustomWrapperScreen;
