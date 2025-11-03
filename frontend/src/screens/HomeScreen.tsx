import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>🎉 드디어 성공! 🎉</Text>
    </SafeAreaView>
  );
}

export default HomeScreen;
