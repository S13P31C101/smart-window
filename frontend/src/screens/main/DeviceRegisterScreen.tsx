import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { COLORS } from '@/constants/color';
import { useRegisterDevice } from '@/api/device';

function DeviceRegisterScreen() {
  const navigation = useNavigation();
  const [deviceUniqueId, setDeviceUniqueId] = useState('');
  const [deviceName, setDeviceName] = useState('');

  const { mutate: registerDevice, isPending } = useRegisterDevice();

  const handleRegister = () => {
    console.log('--- 1. 등록하기 버튼 클릭 ---');
    console.log('입력된 ID:', deviceUniqueId);
    console.log('입력된 이름:', deviceName);

    if (!deviceUniqueId.trim() || !deviceName.trim()) {
      Alert.alert('입력 오류', '기기 고유 ID와 이름을 모두 입력해주세요.');
      return;
    }

    registerDevice(
      { deviceUniqueId, deviceName },
      {
        onSuccess: () => {
          Alert.alert('성공', '새로운 기기를 성공적으로 등록했습니다.');
          navigation.goBack();
        },
        onError: error => {
          // --- 에러 로그를 자세히 출력하도록 수정 ---
          console.error('--- 2. 기기 등록 실패 ---', error);
          Alert.alert(
            '등록 실패',
            error.message || '기기 등록 중 알 수 없는 오류가 발생했습니다.',
          );
          // ------------------------------------
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="새 기기 등록" />
      <View style={styles.content}>
        <Text style={styles.label}>기기 고유 ID</Text>
        <TextInput
          style={styles.input}
          value={deviceUniqueId}
          onChangeText={setDeviceUniqueId}
          placeholder="기기 뒷면의 고유 ID를 입력하세요"
          placeholderTextColor={COLORS.textDisabled}
        />

        <Text style={styles.label}>기기 이름</Text>
        <TextInput
          style={styles.input}
          value={deviceName}
          onChangeText={setDeviceName}
          placeholder="앱에 표시될 기기 이름을 입력하세요"
          placeholderTextColor={COLORS.textDisabled}
        />

        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isPending}>
          {isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>등록하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceCardDark,
    color: COLORS.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textDisabled,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeviceRegisterScreen;
