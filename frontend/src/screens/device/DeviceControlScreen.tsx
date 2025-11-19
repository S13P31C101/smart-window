import React from 'react';
import { StyleSheet, View } from 'react-native';
import DeviceTopTabNavigator from '@/navigation/DeviceTopTabNavigator';
import Header from '@/components/common/Header';

const DeviceControlScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="제어" />
      <DeviceTopTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

export default DeviceControlScreen;