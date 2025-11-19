import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetMusicList, MusicResponse, useRegisterMusic } from '@/api/music';
// useUpdateDeviceMusic을 device.ts에서 가져옵니다.
import { useGetDevices, useUpdateDeviceMusic } from '@/api/device';

// // 음악 데이터 타입 정의
// type MusicTrack = {
//   id: string;
//   title: string;
//   artist: string;
//   duration: string;
// };

// 개별 음악 항목을 렌더링하는 컴포넌트
const MusicListItem = ({
  item,
  isActive,
  onPlayPause,
}: {
  item: MusicResponse;
  isActive: boolean;
  onPlayPause: (track: MusicResponse) => void;
}) => {
  return (
    <View style={styles.trackItem}>
      <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
        <Icon name={'musical-notes'} size={24} color={isActive ? '#FFF' : '#94A3B8'} />
      </View>
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, isActive && styles.activeText]}>{item.musicName}</Text>
        <Text style={styles.trackArtist}>{item.musicUrl}</Text>
      </View>
      <Text style={styles.trackDuration}>{item.duration}</Text>
      <TouchableOpacity onPress={() => onPlayPause(item)} style={styles.playButton}>
        <Icon name={isActive ? 'pause' : 'play'} size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

function MusicScreen() {
  // =================================================================
  // 1. 모든 훅(Hook) 호출을 컴포넌트 최상단에 배치합니다.
  // =================================================================
  const { data: devices, isLoading: isDeviceLoading, isError: isDeviceError } = useGetDevices();
  const device = devices?.[0];
  // useUpdateDevice가 아닌 useUpdateDeviceMusic을 사용합니다.
  const { mutate: updateDeviceMusic } = useUpdateDeviceMusic();
  const { data: musicList, isLoading: isMusicLoading, isError: isMusicError } = useGetMusicList();
  const { mutate: registerMusic } = useRegisterMusic();

  const [modalVisible, setModalVisible] = useState(false);
  const [musicName, setMusicName] = useState('');
  const [musicUrl, setMusicUrl] = useState('');

  // =================================================================
  // 2. 훅 호출이 모두 끝난 후에 로딩/에러 상태를 처리합니다.
  // =================================================================
  if (isDeviceLoading || isMusicLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFF" />
        <Text style={styles.loadingText}>
          {isDeviceLoading ? '장치 정보 로딩 중...' : '음악 목록을 불러오는 중...'}
        </Text>
      </View>
    );
  }

  if (isDeviceError || isMusicError || !device) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>데이터를 불러오는 데 실패했습니다.</Text>
      </View>
    );
  }

  // =================================================================
  // 3. 핸들러 함수 및 렌더링 로직을 배치합니다.
  // =================================================================
  const handlePlayPause = (track: MusicResponse) => {
    // device가 없을 경우를 대비한 방어 코드
    if (!device) return;

    if (device.musicId === track.musicId) {
      // 음악 멈춤: musicId에 null을 전달
      updateDeviceMusic({ deviceId: device.deviceId, data: { musicId: null } });
    } else {
      // 음악 재생: 선택한 트랙의 musicId를 전달
      updateDeviceMusic({ deviceId: device.deviceId, data: { musicId: track.musicId } });
    }
  };

  const handleRegisterMusic = () => {
    if (!musicName.trim() || !musicUrl.trim()) {
      Alert.alert('입력 오류', '음악 이름과 URL을 모두 입력해주세요.');
      return;
    }

    // musicUrl을 큰따옴표로 감싸줍니다.
    const formattedMusicUrl = `"${musicUrl}"`;

    registerMusic(
      { musicName, musicUrl: formattedMusicUrl, registrantType: 'USER' },
      {
        onSuccess: () => {
          Alert.alert('성공', '새로운 음악이 등록되었습니다.');
          setModalVisible(false);
          setMusicName('');
          setMusicUrl('');
        },
        onError: error => {
          Alert.alert('실패', `음악 등록에 실패했습니다: ${error.message}`);
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>새로운 음악 등록</Text>
            <TextInput
              style={styles.input}
              placeholder="음악 이름"
              placeholderTextColor="#94A3B8"
              value={musicName}
              onChangeText={setMusicName}
            />
            <TextInput
              style={styles.input}
              placeholder="음악 URL (예: YouTube 링크)"
              placeholderTextColor="#94A3B8"
              value={musicUrl}
              onChangeText={setMusicUrl}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.registerButton]}
                onPress={handleRegisterMusic}>
                <Text style={styles.buttonText}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={musicList}
        renderItem={({ item }) => (
          <MusicListItem
            item={item}
            isActive={device.musicId === item.musicId}
            onPlayPause={handlePlayPause}
          />
        )}
        keyExtractor={item => item.musicId.toString()}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>음악 목록</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
              <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A2F4D',
    },
    headerTitle: {
        color: '#E0E5EB',
        fontSize: 22,
        fontWeight: 'bold',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 12,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(90, 106, 138, 0.3)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#2D4A6E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activeIconContainer: {
      backgroundColor: '#60A5FA',
    },
    trackInfo: {
        flex: 1,
    },
    trackTitle: {
        color: '#E0E5EB',
        fontSize: 16,
        fontWeight: '600',
    },
    trackArtist: {
        color: '#94A3B8',
        fontSize: 14,
        marginTop: 4,
    },
    activeText: {
        color: '#60A5FA', // 활성 탭 색상
    },
    trackDuration: {
        color: '#94A3B8',
        fontSize: 14,
        marginHorizontal: 16,
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1A2F4D',
    },
    loadingText: {
      color: '#E0E5EB',
      fontSize: 18,
      marginTop: 10,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 12,
    },
    addButton: {
      backgroundColor: '#3B82F6',
      padding: 8,
      borderRadius: 20,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1A2F4D',
    },
    // Modal Styles
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalView: {
      width: '85%',
      backgroundColor: '#1E293B',
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      marginBottom: 20,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: '#E0E5EB',
    },
    input: {
      width: '100%',
      backgroundColor: '#0F172A',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      color: 'white',
      fontSize: 16,
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
    },
    modalButton: {
      borderRadius: 10,
      paddingVertical: 12,
      flex: 1,
    },
    cancelButton: {
      backgroundColor: '#334155',
      marginRight: 10,
    },
    registerButton: {
      backgroundColor: '#3B82F6',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 16,
    },
});

export default MusicScreen;
