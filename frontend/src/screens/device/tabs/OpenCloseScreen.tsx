import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  FlatList,
  Button,
  Animated,
  PanResponder,
} from 'react-native';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { useFocusEffect } from '@react-navigation/native'; // useFocusEffect import
import { useDeviceStore } from '@/stores/deviceStore'; // 스토어 import

const SERVICE_UUID = '2b8d0001-6828-46af-98aa-557761b15400';
const WRITE_CHARACTERISTIC_UUID = '2b8d0002-6828-46af-98aa-557761b15400';

const bleManager = new BleManager();

const { width } = Dimensions.get('window');
const WINDOW_FRAME_WIDTH = width - 80;
const PANE_WIDTH = (WINDOW_FRAME_WIDTH - 8) / 2;
const WINDOW_FRAME_HEIGHT = PANE_WIDTH * 1.1;

function OpenCloseScreen() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [percentage, setPercentage] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('기기를 찾는 중...');

  const translateX = useRef(new Animated.Value(0)).current;
  const lastPosition = useRef(0);
  const setOpenPercentage = useDeviceStore(state => state.setOpenPercentage); // 스토어 함수 가져오기

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
        granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
        granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
      );
    }
    return true;
  };

  const scanForDevices = async () => {
    const permissions = await requestPermissions();
    if (!permissions) {
      Alert.alert('권한 오류', 'BLE 스캔을 위한 권한이 필요합니다.');
      return;
    }
    setAllDevices([]);
    setIsScanning(true);
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setIsScanning(false);
        return;
      }
      if (device && (device.name || device.localName)) {
        setAllDevices(prev => {
          if (!prev.find(d => d.id === device.id)) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };
  
  const connectToDevice = async (device: Device) => {
    try {
      bleManager.stopDeviceScan();
      setIsScanning(false);
      const connected = await device.connect();
      setConnectedDevice(connected);
      await connected.discoverAllServicesAndCharacteristics();
    } catch (e) {
      console.error('Connection failed', e);
    }
  };

  const disconnectDevice = () => {
    // --- 진행 중인 스캔을 먼저 멈춥니다. ---
    bleManager.stopDeviceScan();
    setIsScanning(false);

    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setPercentage(0);
      lastPosition.current = 0;
      translateX.setValue(0);
    }
  };

  const writePercentage = async (value: number) => {
    if (!connectedDevice) return;
    try {
      const data = [0x2a, 0x17, 0x10, 0x00, 0x00, Math.round(value)];
      const base64Data = Buffer.from(data).toString('base64');
      
      console.log(`[BLE] Attempting to write: ${Math.round(value)}% (Base64: ${base64Data})`);

      // --- 함수를 'WithResponse'에서 'WithoutResponse'로 변경합니다. ---
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        connectedDevice.id,
        SERVICE_UUID,
        WRITE_CHARACTERISTIC_UUID,
        base64Data
      );

      console.log('[BLE] Write command sent successfully (without response).');

    } catch (e) {
      console.error('[BLE] Write failed:', e);
      // 'WithoutResponse'는 보통 실패 시에도 에러를 던지지 않을 수 있으나,
      // 만약을 위해 로그는 남겨둡니다.
    }
  };
  
  const handleSliderChange = (value: number) => {
    setPercentage(value);
    const newPosition = (value / 100) * PANE_WIDTH;
    lastPosition.current = newPosition;
    translateX.setValue(newPosition);
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      // 드래그 시작 시 아무것도 할 필요가 없습니다. lastPosition.current를 기준으로 계산합니다.
      onPanResponderGrant: () => {},
      // 드래그 중일 때
      onPanResponderMove: (e, gesture) => {
        let newPosition = lastPosition.current + gesture.dx;

        // 창문이 프레임을 벗어나지 않도록 위치를 제한합니다.
        if (newPosition < 0) newPosition = 0;
        if (newPosition > PANE_WIDTH) newPosition = PANE_WIDTH;

        // 애니메이션 값과 퍼센트 UI를 실시간으로 업데이트합니다.
        translateX.setValue(newPosition);
        setPercentage((newPosition / PANE_WIDTH) * 100);
      },
      // 드래그가 끝났을 때
      onPanResponderRelease: (_, gestureState) => {
        let finalPosition = lastPosition.current + gestureState.dx;

        // 최종 위치도 제한합니다.
        if (finalPosition < 0) finalPosition = 0;
        if (finalPosition > PANE_WIDTH) finalPosition = PANE_WIDTH;

        // 다음 드래그를 위해 마지막 위치를 업데이트합니다.
        lastPosition.current = finalPosition;
        
        const finalPercentage = (finalPosition / PANE_WIDTH) * 100;

        // 최종 퍼센트 값을 BLE 기기로 전송합니다.
        writePercentage(finalPercentage);
        setOpenPercentage(finalPercentage); // << 전역 상태 업데이트 추가
      },
    })
  ).current;

  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity style={styles.deviceItem} onPress={() => connectToDevice(item)}>
      <Text style={styles.deviceText}>{item.name || item.localName || 'Unknown'}</Text>
      <Text style={styles.deviceText}>{item.id}</Text>
    </TouchableOpacity>
  );

  // --- 자동 연결 로직 (핵심) ---
  useFocusEffect(
    useCallback(() => {
      const targetDeviceName = 'CLWM-B07';
      let isConnecting = false;

      const scanAndConnect = async () => {
        try {
          // 1. 스캔 시작
          setStatusMessage(`'${targetDeviceName}' 기기를 스캔 중...`);
          bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
              console.error('Scan error:', error);
              setStatusMessage('스캔 중 오류 발생');
              bleManager.stopDeviceScan();
              return;
            }

            // 2. 기기 발견 시 이름 확인
            if (device && device.name === targetDeviceName && !isConnecting) {
              isConnecting = true;
              bleManager.stopDeviceScan(); // 찾았으면 스캔 중지
              // setStatusMessage(`'${targetDeviceName}'에 연결됨`);

              // 3. 연결 시도
              connectToDevice(device); // 기존에 있던 연결 함수 재사용
            }
          });
          
          // 10초 후에도 못 찾으면 스캔 중지
          setTimeout(() => {
            if (!isConnecting && !connectedDevice) {
              bleManager.stopDeviceScan();
              // setStatusMessage(`'${targetDeviceName}'을 찾을 수 없습니다.`);
            }
          }, 10000);

        } catch (error) {
          console.error('Auto-connect error:', error);
          setStatusMessage('자동 연결 실패');
        }
      };

      if (!connectedDevice) { // 이미 연결된 기기가 없을 때만 실행
        scanAndConnect();
      }

      // 화면을 벗어날 때 정리(cleanup) 함수
      return () => {
        bleManager.stopDeviceScan();
        console.log('[BLE] Leaving screen, scan stopped.');
      };
    }, [connectedDevice]) // connectedDevice가 바뀔 때마다 이 효과를 재평가
  );
  // ---------------------------------

  return (
    <LinearGradient colors={['#1A2F4D', '#2D5580']} style={styles.container}>
      {connectedDevice ? (
        <View style={styles.controlContainer}>
          {/* <Text style={styles.title}>연결됨: {connectedDevice.name}</Text> */}
          <View style={styles.windowContainer}>
            <View style={styles.fixedPane} />
            <Animated.View 
                style={[styles.slidingPane, { transform: [{ translateX }] }]} 
                {...panResponder.panHandlers}
            />
          </View>
          <Text style={styles.percentageValue}>{`${Math.round(percentage)}%`}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={percentage}
            onValueChange={handleSliderChange}
            onSlidingComplete={value => {
              writePercentage(value);
              setOpenPercentage(value); // 전역 상태 업데이트
            }}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#5A6A8A"
            thumbTintColor="#FFFFFF"
          />
          <Button title="연결 해제" onPress={disconnectDevice} color="#E53935" />
        </View>
      ) : (
        <View style={styles.scanContainer}>
          <Text style={styles.title}>창문 제어</Text>
          <TouchableOpacity 
            style={[styles.scanButton, isScanning && styles.scanButtonDisabled]} 
            onPress={scanForDevices} 
            disabled={isScanning}
          >
            {isScanning ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.scanButtonText}>주변 기기 검색</Text>}
          </TouchableOpacity>
          <FlatList
            data={allDevices}
            renderItem={renderDeviceItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />
        </View>
      )}
      <Text style={styles.statusMessage}>{statusMessage}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { color: '#F0F7FF', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  scanContainer: { flex: 1 },
  scanButton: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 10, alignItems: 'center' },
  scanButtonDisabled: { backgroundColor: '#5A6A8A' },
  scanButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  list: { marginTop: 20 },
  deviceItem: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, marginBottom: 10, borderRadius: 8 },
  deviceText: { color: '#FFFFFF' },
  controlContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  percentageValue: { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold', marginVertical: 20 },
  slider: { width: '100%', height: 40 },
  windowContainer: {
    width: WINDOW_FRAME_WIDTH,
    height: WINDOW_FRAME_HEIGHT,
    backgroundColor: '#243B55',
    borderColor: '#4A5E7E',
    borderWidth: 4,
    borderRadius: 16,
    marginBottom: 20,
  },
  fixedPane: {
    position: 'absolute',
    right: 4,
    top: 4,
    bottom: 4,
    width: PANE_WIDTH,
    borderColor: '#708090',
    borderWidth: 2,
    borderRadius: 12,
  },
  slidingPane: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: PANE_WIDTH,
    backgroundColor: '#ADB5BD',
    borderColor: '#495057',
    borderWidth: 4,
    borderRadius: 12,
  },
  statusMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default OpenCloseScreen;
