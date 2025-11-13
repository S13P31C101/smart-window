import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// 임시 데이터 타입 정의
type MediaItem = {
  id: string;
  title: string;
  timestamp: string;
  imageUrl: string;
};

// 목업 이미지와 유사한 임시 데이터
const mockData: MediaItem[] = [
  {
    id: '1',
    title: '미니멀 건축',
    timestamp: '2시간 전',
    imageUrl: 'https://images.unsplash.com/photo-1588692188623-3a5de8752494', // 임시 이미지 URL
  },
  {
    id: '2',
    title: '화이트 인테리어',
    timestamp: '1일 전',
    imageUrl: 'https://images.unsplash.com/photo-1596205252494-00109b859e19', // 임시 이미지 URL
  },
];

// 각 아이템을 렌더링할 컴포넌트
const MediaCard = ({ item }: { item: MediaItem }) => (
  <View style={styles.card}>
    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardTimestamp}>{item.timestamp}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backgroundButton}>
          <Text style={styles.buttonText}>배경만</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.videoButton}>
          <Icon name="play" size={16} color="#FFF" />
          <Text style={[styles.buttonText, { marginLeft: 8 }]}>동영상 보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

function StorageScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockData}
        renderItem={({ item }) => <MediaCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2F4D',
  },
  listContent: {
    padding: 24,
  },
  card: {
    backgroundColor: '#E0E5EB', // 카드 배경색
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden', // borderRadius를 이미지에 적용하기 위해
  },
  cardImage: {
    width: '100%',
    height: 200,
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
});

export default StorageScreen;