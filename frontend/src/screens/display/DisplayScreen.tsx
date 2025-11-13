import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '@/components/common/Header';
import DisplayTopTabNavigator from '@/navigation/DisplayTopTabNavigator';

const DisplayScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="화면" />
      <DisplayTopTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

export default DisplayScreen;
