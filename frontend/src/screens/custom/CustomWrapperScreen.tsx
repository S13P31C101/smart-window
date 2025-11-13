import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '@/components/common/Header';
import CustomTopTabNavigator from '@/navigation/CustomTopTabNavigator';

const CustomWrapperScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="설정" />
      <CustomTopTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

export default CustomWrapperScreen;
