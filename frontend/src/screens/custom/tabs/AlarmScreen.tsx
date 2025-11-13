import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, TouchableOpacity, Button } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type Alarm = {
  id: string;
  time: string;
  days: string;
  description: string;
  isEnabled: boolean;
};

const initialAlarmData: Alarm[] = [
  {
    id: '1',
    time: '07:00',
    days: '평일',
    description: '서서히 밝아지기',
    isEnabled: true,
  },
];

const AlarmScreen = () => {
  const [alarms, setAlarms] = useState(initialAlarmData);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const toggleSwitch = (id: string) => {
    setAlarms(prevAlarms =>
      prevAlarms.map(alarm =>
        alarm.id === id ? { ...alarm, isEnabled: !alarm.isEnabled } : alarm,
      ),
    );
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const newAlarm: Alarm = {
      id: String(Date.now()),
      time: `${hours}:${minutes}`,
      days: '매일',
      description: '새로운 알람',
      isEnabled: true,
    };
    setAlarms(prevAlarms => [...prevAlarms, newAlarm]);
    hideDatePicker();
  };

  const renderItem = ({ item }: { item: Alarm }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon name="notifications-outline" size={24} color="#FBBF24" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={styles.daysText}>{item.days}</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
      <Switch
        trackColor={{ false: '#3E3E3E', true: '#FBBF24' }}
        thumbColor={item.isEnabled ? '#F59E0B' : '#f4f3f4'}
        onValueChange={() => toggleSwitch(item.id)}
        value={item.isEnabled}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={alarms}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.scrollContent}
      />

      <TouchableOpacity style={styles.addButton} onPress={showDatePicker}>
        <Icon name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>알람 추가</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        headerTextIOS="알람 시간 선택"
        confirmTextIOS="확인"
        cancelTextIOS="취소"
      />
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
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
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
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  daysText: {
    color: '#94A3B8',
    fontSize: 14,
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

export default AlarmScreen;