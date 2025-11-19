import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';

const SensorScreen = () => {
  const [co2Enabled, setCo2Enabled] = useState(true);
  const [rainEnabled, setRainEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcon name="weather-windy" size={24} color="#38BDF8" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>CO2 센서 환기</Text>
              <Text style={styles.description}>1000ppm 이상 시 자동 환기</Text>
            </View>
            <Switch
              trackColor={{ false: '#3E3E3E', true: '#81b0ff' }}
              thumbColor={co2Enabled ? '#3B82F6' : '#f4f3f4'}
              onValueChange={() => setCo2Enabled(prev => !prev)}
              value={co2Enabled}
            />
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>현재 CO2 농도</Text>
            <Text style={styles.statusValue}>850 ppm</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcon name="weather-rainy" size={24} color="#38BDF8" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>비 감지 자동 개폐</Text>
              <Text style={styles.description}>비 올 때 창문 자동 닫기</Text>
            </View>
            <Switch
              trackColor={{ false: '#3E3E3E', true: '#81b0ff' }}
              thumbColor={rainEnabled ? '#3B82F6' : '#f4f3f4'}
              onValueChange={() => setRainEnabled(prev => !prev)}
              value={rainEnabled}
            />
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>현재 날씨</Text>
            <Text style={styles.statusValue}>맑음 ☀️</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>자동화 추가</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  statusContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  statusLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 5,
  },
  statusValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SensorScreen;