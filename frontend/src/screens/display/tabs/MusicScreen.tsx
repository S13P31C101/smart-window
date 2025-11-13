import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// 음악 데이터 타입 정의
type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  duration: string;
};

// 프로젝트 컨셉에 맞는 임시 음악 데이터
const mockMusicData: MusicTrack[] = [
  { id: '1', title: '아침의 이슬', artist: '자연의 소리', duration: '3:45' },
  { id: '2', title: '평화로운 피아노', artist: '악기 연주', duration: '5:12' },
  { id: '3', title: '비 오는 날', artist: '자연의 소리', duration: '10:00' },
  { id: '4', title: '카페의 오후', artist: '재즈', duration: '4:20' },
  { id: '5', title: '해변의 파도', artist: '자연의 소리', duration: '8:30' },
  { id: '6', title: '공부할 때 듣는 로파이', artist: '로파이 힙합', duration: '2:55' },
];

function MusicScreen() {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = (trackId: string) => {
    if (currentTrackId === trackId && isPlaying) {
      // 현재 재생 중인 곡을 일시정지
      setIsPlaying(false);
      // TODO: 오디오 일시정지 로직 추가
    } else {
      // 새로운 곡을 재생 (또는 일시정지된 곡을 다시 재생)
      setCurrentTrackId(trackId);
      setIsPlaying(true);
      // TODO: 오디오 재생 로직 추가
    }
  };
  
  // 개별 음악 항목을 렌더링하는 컴포넌트
  const MusicListItem = ({ item }: { item: MusicTrack }) => {
    const isActive = currentTrackId === item.id && isPlaying;

    return (
      <View style={styles.trackItem}>
        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
            <Icon name={'musical-notes'} size={24} color={isActive ? '#FFF' : '#94A3B8'} />
        </View>
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, isActive && styles.activeText]}>{item.title}</Text>
          <Text style={styles.trackArtist}>{item.artist}</Text>
        </View>
        <Text style={styles.trackDuration}>{item.duration}</Text>
        <TouchableOpacity onPress={() => handlePlayPause(item.id)} style={styles.playButton}>
          <Icon name={isActive ? 'pause' : 'play'} size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockMusicData}
        renderItem={({ item }) => <MusicListItem item={item} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={<Text style={styles.headerTitle}>음악 목록</Text>}
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
});

export default MusicScreen;
