import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ListRenderItemInfo, // 1. ListRenderItemInfo 타입을 import 합니다.
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetMyMedia, useUpdateMediaName, useDeleteMedia } from '@/api/media';
import type { MediaResponse } from '@/api/media';
import { useUpdateDeviceMedia } from '@/api/device'; // 1. 디바이스 미디어 변경 훅 import
import { useDeviceStore } from '@/stores/deviceStore'; // 2. 현재 선택된 디바이스 ID를 가져오기 위해 import

type MediaCardProps = {
  item: MediaResponse;
  onUpdateName: (mediaId: number, currentName: string) => void;
  onDelete: (mediaId: number) => void;
  onApplyToDevice: (mediaId: number) => void; // 3. 디바이스 적용 핸들러 prop 추가
};

// 각 아이템을 렌더링할 컴포넌트
const MediaCard = ({ item, onUpdateName, onDelete, onApplyToDevice }: MediaCardProps) => (
  <View style={styles.card}>
    <Image source={{ uri: item.downloadUrl }} style={styles.cardImage} />
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onUpdateName(item.mediaId, item.fileName)}>
        <Icon name="pencil" size={20} color="#475569" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onDelete(item.mediaId)}>
        <Icon name="trash-outline" size={22} color="#DC2626" />
      </TouchableOpacity>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.fileName}</Text>
      <Text style={styles.cardTimestamp}>
        {new Date(item.createdAt).toLocaleString('ko-KR')}
      </Text>
      {/* 4. 기존 버튼 컨테이너를 '디바이스에 적용' 버튼 하나로 교체 */}
      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => onApplyToDevice(item.mediaId)}
      >
        <Icon name="phone-portrait-outline" size={18} color="#FFF" />
        <Text style={styles.applyButtonText}>디바이스에 적용</Text>
      </TouchableOpacity>
    </View>
  </View>
);

function StorageScreen() {
  // 5. 모든 훅 호출을 컴포넌트 최상단에 배치합니다.
  const { data: mediaList, isLoading, isError, error } = useGetMyMedia();
  const { mutate: updateName } = useUpdateMediaName();
  const { mutate: deleteMedia } = useDeleteMedia();
  const { mutate: updateDeviceMedia } = useUpdateDeviceMedia();
  const selectedDeviceId = useDeviceStore(state => state.selectedDeviceId);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaResponse | null>(null);
  const [newName, setNewName] = useState('');

  // '수정' 버튼을 눌렀을 때 모달을 열어주는 함수
  const handleOpenUpdateModal = (item: MediaResponse) => {
    setEditingMedia(item);
    setNewName(item.fileName);
    setIsModalVisible(true);
  };

  // 모달의 '확인' 버튼을 눌렀을 때 실제 별명 변경을 실행하는 함수
  const handleConfirmUpdateName = () => {
    if (editingMedia && newName.trim()) {
      updateName({ mediaId: editingMedia.mediaId, fileName: newName.trim() });
      setIsModalVisible(false); // 모달 닫기
      setEditingMedia(null); // 상태 초기화
    }
  };

  const handleDelete = (mediaId: number) => {
    Alert.alert('파일 삭제', '정말로 이 파일을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteMedia(mediaId),
      },
    ]);
  };

  // 6. 디바이스에 미디어를 적용하는 핸들러 함수 추가
  const handleApplyToDevice = (mediaId: number) => {
    if (!selectedDeviceId) {
      Alert.alert('오류', '디바이스가 선택되지 않았습니다.');
      return;
    }
    updateDeviceMedia(
      { deviceId: selectedDeviceId, data: { mediaId } },
      {
        onSuccess: () => {
          Alert.alert('성공', '이미지가 디바이스에 적용되었습니다.');
        },
        onError: () => {
          Alert.alert('오류', '이미지를 적용하는 중 문제가 발생했습니다.');
        }
      }
    );
  };

  // 2. 모든 훅이 호출된 이후에 로딩 및 에러 상태를 처리합니다.
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Text>
        {/* @ts-ignore */}
        <Text style={styles.errorText}>{error?.message}</Text>
      </View>
    );
  }

  // 7. FlatList에 들어갈 데이터를 'ORIGINAL' 타입만 필터링합니다.
  const originalMedia = mediaList?.filter(item => item.originType === 'ORIGINAL');

  return (
    <View style={styles.container}>
      {/* --- 커스텀 입력 모달 UI --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>별명 변경</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="새로운 파일 별명을 입력하세요"
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmUpdateName}>
                <Text style={styles.modalButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* --- 여기까지 --- */}

      <FlatList
        data={originalMedia} // 8. 필터링된 데이터를 사용합니다.
        renderItem={({ item }: ListRenderItemInfo<MediaResponse>) => ( // 2. item의 타입을 명시합니다.
          <MediaCard
            item={item}
            onUpdateName={() => handleOpenUpdateModal(item)}
            onDelete={handleDelete}
            onApplyToDevice={handleApplyToDevice}
          />
        )}
        keyExtractor={(item: MediaResponse) => item.mediaId.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="archive-outline" size={60} color="#8291AC" />
            <Text style={styles.emptyText}>업로드된 미디어가 없습니다.</Text>
            <Text style={styles.emptySubText}>
              '등록' 탭에서 이미지를 추가해주세요.
            </Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  errorText: {
    color: '#FFBABA',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#E0E5EB',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    color: '#8291AC',
    fontSize: 14,
    marginTop: 8,
  },
  listContent: {
    padding: 24,
  },
  card: {
    backgroundColor: '#E0E5EB',
    borderRadius: 16,
    marginBottom: 24,
    // 그림자 효과 (플랫폼에 따라 다르게 적용됨)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
    // 버튼 컨테이너에도 그림자 효과 추가
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 6,
  },
  actionButton: {
    padding: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
    // 카드의 borderRadius와 맞춰주기 위해 이미지 상단에도 radius 적용
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  cardTimestamp: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16, // 10. 적용 버튼과의 간격을 위해 마진 추가
  },
  // 11. 기존 buttonContainer, backgroundButton, videoButton 관련 스타일 제거
  // 12. 새로운 applyButton 관련 스타일 추가
  applyButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // --- 모달 스타일 추가 ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
  },
  confirmButton: {
    backgroundColor: '#1E3A8A',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  // --- 여기까지 ---
});

export default StorageScreen;