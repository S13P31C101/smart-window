import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type Schedule = {
  id: string;
  time: string;
  title: string;
  description: string;
  isEnabled: boolean;
};

const initialScheduleData: Schedule[] = [
  {
    id: '1',
    time: '07:00',
    title: '아침 환기',
    description: '창문 50% 개방',
    isEnabled: true,
  },
  {
    id: '2',
    time: '08:30',
    title: '출근 모드',
    description: '창문 닫기 + 조명 끄기',
    isEnabled: true,
  },
  {
    id: '3',
    time: '18:30',
    title: '귀가 모드',
    description: '밝기 30% + 투명 모드',
    isEnabled: false,
  },
];

const CustomScreen = () => {
  const [schedules, setSchedules] = useState(initialScheduleData);

  const toggleSwitch = (id: string) => {
    setSchedules(
      schedules.map(schedule =>
        schedule.id === id ? { ...schedule, isEnabled: !schedule.isEnabled } : schedule
      )
    );
  };

  const renderItem = ({ item }: { item: Schedule }) => (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Icon name="time-outline" size={24} color="#94A3B8" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
      <Switch
        trackColor={{ false: '#3E3E3E', true: '#81b0ff' }}
        thumbColor={item.isEnabled ? '#3B82F6' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => toggleSwitch(item.id)}
        value={item.isEnabled}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>스케줄 추가</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  listContent: {
    padding: 20,
  },
  itemContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
  timeText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  titleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  descriptionText: {
    color: '#CBD5E1',
    fontSize: 14,
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

export default CustomScreen;