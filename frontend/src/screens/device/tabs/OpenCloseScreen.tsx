import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const WINDOW_FRAME_WIDTH = width - 80;
// 창틀의 테두리(borderWidth: 4)를 고려하여 내부 창문의 너비를 정밀하게 계산합니다.
const PANE_WIDTH = (WINDOW_FRAME_WIDTH - 8) / 2; 
const WINDOW_FRAME_HEIGHT = PANE_WIDTH * 1.1; // 비율을 살짝 조정하여 더 안정적으로 보이게 합니다.

function OpenCloseScreen() {
  const [openPercentage, setOpenPercentage] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const lastPosition = useRef(0);

  // PanResponder 설정
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateX.setOffset(lastPosition.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        // useNativeDriver: false 일 때만 Animated.event를 안전하게 사용할 수 있습니다.
        // 여기서는 직접 값을 설정하여 호환성 문제를 피합니다.
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        translateX.flattenOffset(); // 오프셋을 값에 합칩니다.
        lastPosition.current += gesture.dx;

        // 이동 범위 제한
        if (lastPosition.current < 0) {
          lastPosition.current = 0;
        } else if (lastPosition.current > PANE_WIDTH) {
          lastPosition.current = PANE_WIDTH;
        }
        
        // 최종 위치로 부드럽게 이동
        Animated.spring(translateX, {
          toValue: lastPosition.current,
          useNativeDriver: true, // 애니메이션 자체에는 네이티브 드라이버 사용
        }).start();
      },
    }),
  ).current;

  // 슬라이더 값 변경 시
  const handleSliderChange = (value: number) => {
    const newPosition = (value / 100) * PANE_WIDTH;
    Animated.timing(translateX, {
      toValue: newPosition,
      duration: 50,
      useNativeDriver: true,
    }).start();
    lastPosition.current = newPosition;
    setOpenPercentage(Math.round(value));
  };
  
  // translateX 값(px)이 openPercentage(%)와 동기화되도록 합니다.
  translateX.addListener(({ value }) => {
    const percentage = (value / PANE_WIDTH) * 100;
    const clampedPercentage = Math.max(0, Math.min(percentage, 100));
    setOpenPercentage(Math.round(clampedPercentage));
  });

  return (
    <LinearGradient colors={['#1A2F4D', '#2D5580']} style={styles.container}>
      <Text style={styles.title}>창문 개폐</Text>

      <View style={styles.windowContainer}>
        <View style={styles.fixedPane} />
        <Animated.View
          style={[styles.slidingPane, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.glassReflection1} />
          <View style={styles.glassReflection2} />
          <View style={styles.handle} />
        </Animated.View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.sliderLabels}>
          <Text style={styles.labelText}>닫힘</Text>
          <Text style={styles.labelText}>열림</Text>
        </View>
        <View style={styles.percentageMarkers}>
          {['0%', '25%', '50%', '75%', '100%'].map(p => (
            <Text key={p} style={styles.markerText}>{p}</Text>
          ))}
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={openPercentage}
          onValueChange={handleSliderChange}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#5A6A8A"
          thumbTintColor="#FFFFFF"
        />
        <Text style={styles.percentageValue}>{`${openPercentage}%`}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
  },
  title: {
    color: '#F0F7FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 40,
    width: '100%',
  },
  windowContainer: {
    width: WINDOW_FRAME_WIDTH,
    height: WINDOW_FRAME_HEIGHT,
    backgroundColor: '#243B55',
    borderColor: '#4A5E7E',
    borderWidth: 4,
    borderRadius: 16,
  },
  fixedPane: {
    position: 'absolute',
    right: 4, // 창틀 안쪽에 위치
    top: 4,
    bottom: 4,
    width: PANE_WIDTH,
    borderColor: '#708090',
    borderWidth: 2,
    borderRadius: 12,
  },
  slidingPane: {
    position: 'absolute',
    left: 4, // 창틀 안쪽에 위치
    top: 4,
    bottom: 4,
    width: PANE_WIDTH,
    backgroundColor: '#ADB5BD',
    borderColor: '#495057',
    borderWidth: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glassReflection1: {
    position: 'absolute',
    width: 2,
    height: '120%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ rotate: '-45deg' }],
    left: '40%',
  },
  glassReflection2: {
    position: 'absolute',
    width: 2,
    height: '120%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ rotate: '-45deg' }],
    left: '55%',
  },
  handle: {
    position: 'absolute',
    right: 12,
    width: 12,
    height: 48,
    backgroundColor: '#89B1F3',
    borderRadius: 6,
  },
  controlsContainer: {
    width: '100%',
    marginTop: 60,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    color: '#B0C4DE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentageMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  markerText: {
    color: '#8291AC',
    fontSize: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  percentageValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default OpenCloseScreen;
