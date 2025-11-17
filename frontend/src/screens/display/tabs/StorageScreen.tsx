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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetMyMedia, useUpdateMediaName, useDeleteMedia } from '@/api/media';
import type { MediaResponse } from '@/api/media';

type MediaCardProps = {
  item: MediaResponse;
  onUpdateName: (mediaId: number, currentName: string) => void;
  onDelete: (mediaId: number) => void;
};

// 각 아이템을 렌더링할 컴포넌트
const MediaCard = ({ item, onUpdateName, onDelete }: MediaCardProps) => (
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backgroundButton}>
          <Text style={styles.buttonText}>배경만</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.videoButton}>
          <Icon name="play" size={16} color="#FFF" />
          <Text style={[styles.buttonText, styles.videoButtonText]}>
            동영상 보기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

function StorageScreen() {
  // 1. 모든 훅 호출을 컴포넌트 최상단에 배치합니다.
  const { data: mediaList, isLoading, isError, error } = useGetMyMedia();
  const { mutate: updateName } = useUpdateMediaName();
  const { mutate: deleteMedia } = useDeleteMedia();
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
        data={mediaList}
        renderItem={({ item }) => (
          <MediaCard
            item={item}
            onUpdateName={() => handleOpenUpdateModal(item)}
            onDelete={handleDelete}
          />
        )}
        keyExtractor={item => item.mediaId.toString()}
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
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12, // 버튼 사이 간격
  },
  backgroundButton: {
    flex: 1,
    backgroundColor: '#A77693', // 배경만 버튼 색상
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoButton: {
    flex: 1,
    backgroundColor: '#1E3A8A', // 동영상 보기 버튼 색상
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoButtonText: {
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