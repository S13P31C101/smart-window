import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Switch, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // 이 라이브러리를 사용하고 계십니다.
import { useGetDeviceAlarms, useUpdateAlarm, useCreateAlarm, useDeleteAlarm, AlarmResponse, DayOfWeek } from '../../../api/alarm';
import { useGetDevices } from '../../../api/device';

const ALL_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_MAP: Record<DayOfWeek, string> = {
  MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목', FRIDAY: '금', SATURDAY: '토', SUNDAY: '일',
};

const formatRepeatDays = (days: DayOfWeek[]): string => {
  if (days.length === 7) return '매일';
  if (days.length === 5 && days.every(d => ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].includes(d))) return '평일';
  if (days.length === 0) return '반복 안함';
  return days.map(day => DAY_MAP[day]).join(', ');
};


const AlarmScreen = () => {
  // =================================================================
  // 1. 모든 훅(Hook) 호출을 컴포넌트 최상단에 배치합니다.
  // =================================================================
  const { data: devices, isLoading: isDeviceLoading, isError: isDeviceError } = useGetDevices();
  const deviceId = devices?.[0]?.deviceId;

  const { data: alarms, isLoading: isAlarmsLoading, isError: isAlarmsError } = useGetDeviceAlarms(deviceId!);
  const { mutate: updateAlarm } = useUpdateAlarm();
  const { mutate: createAlarm } = useCreateAlarm();
  const { mutate: deleteAlarm } = useDeleteAlarm();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<AlarmResponse | null>(null);
  const [alarmName, setAlarmName] = useState('');
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isTimePickerOpen, setTimePickerOpen] = useState(false);

  // =================================================================
  // 2. 훅 호출이 모두 끝난 후에 로딩/에러 상태를 처리합니다.
  // =================================================================
  if (isDeviceLoading) {
    return <View style={styles.center}><ActivityIndicator /><Text style={styles.centerText}>장치 정보 로딩 중...</Text></View>;
  }
  if (isDeviceError || !deviceId) {
    return <View style={styles.center}><Text style={styles.centerText}>장치를 불러오지 못했습니다.</Text></View>;
  }
  if (isAlarmsLoading) {
    return <View style={styles.center}><ActivityIndicator /><Text style={styles.centerText}>알람 목록 로딩 중...</Text></View>;
  }
  if (isAlarmsError) {
    return <View style={styles.center}><Text style={styles.centerText}>알람 목록을 불러오지 못했습니다.</Text></View>;
  }
  
  // =================================================================
  // 3. 핸들러 함수들을 정의합니다.
  // =================================================================
  const openAlarmModal = (alarm: AlarmResponse | null) => {
    // ... (이하 로직은 이전과 동일)
    if (alarm) {
      setEditingAlarm(alarm);
      setAlarmName(alarm.alarmName);
      const [hours, minutes] = alarm.alarmTime.split(':');
      const timeToEdit = new Date();
      timeToEdit.setHours(parseInt(hours, 10));
      timeToEdit.setMinutes(parseInt(minutes, 10));
      setAlarmTime(timeToEdit);
      setRepeatDays(alarm.repeatDays);
      setIsActive(alarm.isActive);
    } else {
      setEditingAlarm(null);
      setAlarmName('새로운 알람');
      setAlarmTime(new Date());
      setRepeatDays([]);
      setIsActive(true);
    }
    setModalVisible(true);
  };

  const handleSaveAlarm = () => {
    const hours = String(alarmTime.getHours()).padStart(2, '0');
    const minutes = String(alarmTime.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:00`;

    if (editingAlarm) {
      updateAlarm({
        alarmId: editingAlarm.alarmId,
        alarmName, alarmTime: formattedTime, repeatDays, isActive,
      });
    } else {
      createAlarm({
        deviceId, alarmName, alarmTime: formattedTime, repeatDays, isActive,
      });
    }
    setModalVisible(false);
  };

  const toggleRepeatDay = (day: DayOfWeek) => {
    setRepeatDays((prev: DayOfWeek[]) =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  
  const handleDeleteAlarm = (alarmId: number) => {
    Alert.alert("알람 삭제", "정말로 삭제하시겠습니까?", [
      { text: "취소" }, { text: "삭제", onPress: () => deleteAlarm(alarmId), style: "destructive" }
    ]);
  };

  const handleToggleSwitch = (alarm: AlarmResponse) => {
    // isActive 상태만 바꾸고, 나머지 정보는 기존 알람의 값을 그대로 사용합니다.
    updateAlarm({
      alarmId: alarm.alarmId,
      alarmName: alarm.alarmName,
      alarmTime: alarm.alarmTime,
      repeatDays: alarm.repeatDays,
      isActive: !alarm.isActive, // 수정된 부분
    });
  };
  
  // =================================================================
  // 4. 최종 UI를 렌더링합니다.
  // =================================================================
  return (
    <View style={styles.container}>
      <FlatList
        data={alarms}
        renderItem={({ item }: { item: AlarmResponse }) => (
          <TouchableOpacity onPress={() => openAlarmModal(item)}>
            <View style={styles.card}>
              <View style={styles.iconContainer}><Icon name="notifications-outline" size={24} color="#FBBF24" /></View>
              <View style={styles.textContainer}>
                <Text style={styles.timeText}>{item.alarmTime.substring(0, 5)}</Text>
                <Text style={styles.daysText}>{formatRepeatDays(item.repeatDays)}</Text>
                <Text style={styles.descriptionText}>{item.alarmName}</Text>
              </View>
              <View style={styles.actionsContainer}>
                <Switch trackColor={{ false: '#3E3E3E', true: '#FBBF24' }} thumbColor={item.isActive ? '#F59E0B' : '#f4f3f4'} onValueChange={() => handleToggleSwitch(item)} value={item.isActive} />
                <TouchableOpacity onPress={() => handleDeleteAlarm(item.alarmId)} style={styles.deleteButton}><Icon name="trash-outline" size={24} color="#94A3B8" /></TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item: AlarmResponse) => item.alarmId.toString()}
        contentContainerStyle={styles.scrollContent}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => openAlarmModal(null)}>
        <Icon name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>알람 추가</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingAlarm ? '알람 수정' : '알람 추가'}</Text>
            <TextInput style={styles.input} value={alarmName} onChangeText={setAlarmName} placeholder="알람 이름" placeholderTextColor="#94A3B8" />
            <TouchableOpacity style={styles.timePickerButton} onPress={() => setTimePickerOpen(true)}>
              <Text style={styles.timePickerButtonText}>{`${String(alarmTime.getHours()).padStart(2, '0')}:${String(alarmTime.getMinutes()).padStart(2, '0')}`}</Text>
            </TouchableOpacity>
            <View style={styles.daySelectorContainer}>
              {ALL_DAYS.map(day => (
                <TouchableOpacity key={day} style={[styles.dayButton, repeatDays.includes(day) && styles.dayButtonSelected]} onPress={() => toggleRepeatDay(day)}>
                  <Text style={[styles.dayButtonText, repeatDays.includes(day) && styles.dayButtonTextSelected]}>{DAY_MAP[day]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.modalLabel}>활성화</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>

            {/* 이 부분을 수정합니다. */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveAlarm}>
                <Text style={styles.modalButtonText}>저장</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isTimePickerOpen}
        mode="time"
        date={alarmTime}
        onConfirm={(date: Date) => {
          setTimePickerOpen(false);
          setAlarmTime(date);
        }}
        onCancel={() => {
          setTimePickerOpen(false);
        }}
        title="알람 시간 선택"
        confirmText="확인"
        cancelText="취소"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // --- 기존 스타일 (일부 수정) ---
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  centerText: { color: 'white' },
  scrollContent: { padding: 20, paddingBottom: 100 }, // addButton에 가려지지 않도록 패딩 추가
  card: { backgroundColor: '#1E293B', borderRadius: 12, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconContainer: { backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1, marginRight: 10 },
  timeText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  daysText: { color: '#94A3B8', fontSize: 14, marginVertical: 2 },
  descriptionText: { color: '#CBD5E1', fontSize: 14 },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  deleteButton: { marginLeft: 10, padding: 5 },
  addButton: { backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 20, marginBottom: 20, position: 'absolute', bottom: 0, left: 0, right: 0 },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  // --- 모달 스타일 (개선된 디자인) ---
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 15, padding: 25, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  modalTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  input: { backgroundColor: '#334155', color: 'white', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 20 },
  timePickerButton: { backgroundColor: '#334155', borderRadius: 10, paddingVertical: 12, marginBottom: 20, alignItems: 'center' },
  timePickerButtonText: { color: 'white', fontSize: 24, fontWeight: '600' },
  daySelectorContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 25 },
  dayButton: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', backgroundColor: '#475569' },
  dayButtonSelected: { backgroundColor: '#3B82F6' },
  dayButtonText: { color: '#CBD5E1', fontSize: 14, fontWeight: '600' },
  dayButtonTextSelected: { color: 'white' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingVertical: 10 },
  modalLabel: { color: 'white', fontSize: 18 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, marginLeft: 10 },
  saveButton: { backgroundColor: '#3B82F6' },
  cancelButton: { backgroundColor: '#475569' },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default AlarmScreen;