import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Prop Types Definition ---
type InfoCardProps = {
  icon: string;
  title: string;
  value: string;
  status?: string; // '?'는 status prop이 선택적(optional)이라는 의미
  fullWidth?: boolean;
};

type WeatherCardProps = {
  icon: string;
  weather: string;
  location: string;
  temp: string;
};

// --- Reusable Components ---

// 환경 센서, 창문 상태 등에 사용될 정보 카드 컴포넌트
const InfoCard = ({ icon, title, value, status, fullWidth = false }: InfoCardProps) => (
  <View style={[styles.infoCard, fullWidth && styles.fullWidthCard]}>
    <View style={styles.cardHeader}>
      <MaterialCommunityIcon name={icon} size={22} color="#A8B9D0" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={styles.cardValue}>{value}</Text>
    {status && <Text style={styles.cardStatus}>{status}</Text>}
  </View>
);

// 날씨 정보 전용 카드 컴포넌트
const WeatherCard = ({ icon, weather, location, temp }: WeatherCardProps) => (
  <View style={[styles.infoCard, styles.fullWidthCard, styles.weatherCard]}>
    <View style={styles.leftContent}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcon name={icon} size={22} color="#A8B9D0" />
        <Text style={styles.cardTitle}>날씨</Text>
      </View>
      <Text style={styles.cardStatus}>
        {weather} · {location}
      </Text>
    </View>
    <Text style={styles.weatherTemp}>{temp}°C</Text>
  </View>
);

// --- Main Screen Component ---

function HomeScreen() {
  const [hasImage] = useState(true); // 이미지가 있을 때와 없을 때 UI를 전환하기 위한 상태

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft}>
            <View style={styles.headerIconWrapper}>
              <Icon name="home-outline" size={22} color="#E0E5EB" />
            </View>
            <Text style={styles.headerTitle}>우리 집</Text>
            <Icon name="chevron-down" size={20} color="#E0E5EB" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconWrapper}>
              <Icon name="home-outline" size={22} color="#E0E5EB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconWrapper}>
              <Icon name="add" size={26} color="#E0E5EB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconWrapper}>
              <Icon name="ellipsis-vertical" size={22} color="#E0E5EB" />
              <View style={styles.redDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Display Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>현재 디스플레이</Text>
          {hasImage ? (
            <ImageBackground
              source={{ uri: 'https://i.imgur.com/Gwn3Y2f.jpeg' }} // 임시 이미지
              style={styles.displayImage}
              imageStyle={styles.imageStyle}>
              <Text style={styles.imageText}>자연 풍경</Text>
            </ImageBackground>
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          <TouchableOpacity style={styles.changeButton}>
            <Text style={styles.changeButtonText}>이미지 변경</Text>
          </TouchableOpacity>
        </View>

        {/* Environment Sensors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>환경 센서</Text>
          <View style={styles.cardRow}>
            <InfoCard icon="fan" title="CO2" value="420 ppm" status="정상" />
            <InfoCard icon="thermometer" title="온습도" value="22°C / 45%" status="쾌적" />
          </View>
          <WeatherCard icon="weather-sunny" weather="맑음" location="서울" temp="18" />
        </View>

        {/* Window State Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>창문 상태</Text>
          <View style={styles.cardRow}>
            <InfoCard icon="brightness-6" title="밝기" value="70%" />
            <InfoCard icon="arrow-expand-horizontal" title="개폐도" value="80%" />
          </View>
          <InfoCard icon="view-dashboard-outline" title="투명도" value="투명" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // 다크 블루 배경
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E5EB',
    marginLeft: 8,
    marginRight: 4,
  },
  redDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A8B9D0',
    marginBottom: 16,
  },
  // Display Section
  displayImage: {
    height: 200,
    justifyContent: 'flex-end',
    padding: 16,
  },
  imageStyle: {
    borderRadius: 20,
  },
  imageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    height: 100,
    backgroundColor: '#1E293B',
    borderRadius: 20,
  },
  changeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Cards
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    width: '48%',
  },
  fullWidthCard: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#A8B9D0',
    fontSize: 16,
    marginLeft: 8,
  },
  cardValue: {
    color: '#E0E5EB',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardStatus: {
    color: '#A8B9D0',
    fontSize: 14,
    marginTop: 4,
  },
  // Weather Card
  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {},
  weatherBody: {},
  weatherTemp: {
    color: '#E0E5EB',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
