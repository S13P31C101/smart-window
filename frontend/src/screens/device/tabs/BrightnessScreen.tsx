import React, { useEffect, useRef, useState, memo } from 'react';
import { StyleSheet, Text, View, Animated, Image, Pressable, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';
import { Svg, Circle, G, Defs, Filter, FeDropShadow, Path, RadialGradient, Stop, FeComposite, ClipPath, Rect, FeGaussianBlur, FeOffset, FeMerge, FeMergeNode, Ellipse } from 'react-native-svg';
import { COLORS } from '@/constants/color';

// --- 상수 정의 ---
const UI_COLORS = {
  switchTrackOn: '#A77693',
  switchTrackOff: '#174871',
  switchThumbOn: '#174871',
  switchThumbOff: '#FFFFFF',
  glowCenter: 'rgb(248, 245, 221)', // 알파값 제거
  glowEdge: 'rgb(248, 245, 221)',   // 알파값 제거
  lightBeam: '#F8F5DD',
  lampOverlay: '#F8F5DD',
};
const ANIMATION_DURATION = 300;
const { width } = Dimensions.get('window');

const AnimatedStop = Animated.createAnimatedComponent(Stop); // AnimatedStop 추가

// --- 헬퍼 컴포넌트 ---
const Icons8Light = memo(({ opacity }: { opacity: number }) => (
  <View style={{ width: 34, height: 34 }}>
    <Icon name="bulb" size={34} color={`rgba(255, 255, 255, ${opacity})`} />
  </View>
));

const ToggleThumb = memo(({ isOn }: { isOn: boolean }) => (
  <Svg height="20" width="20" viewBox="0 0 24 24">
    <Defs>
      <Filter id="shadow">
        <FeGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
        <FeOffset in="blur" dx="0" dy="1" result="offsetBlur" />
        <FeMerge>
          <FeMergeNode in="offsetBlur" />
          <FeMergeNode in="SourceGraphic" />
        </FeMerge>
      </Filter>
    </Defs>
    <Circle cx="12" cy="11" r="10" fill={isOn ? UI_COLORS.switchThumbOn : UI_COLORS.switchThumbOff} filter="url(#shadow)" />
  </Svg>
));

// 빛 줄기 효과를 옆으로 긴 타원의 절반 모양으로 수정
const LightBeamEffect = memo(() => (
  <Svg height="100%" width="100%" viewBox="0 0 100 35">
    <Defs>
      <ClipPath id="clip">
        <Rect x="0" y="0" width="100" height="35" />
      </ClipPath>
      <Filter id="beam_blur">
        <FeGaussianBlur in="SourceGraphic" stdDeviation="2" />
      </Filter>
    </Defs>
    <G filter="url(#beam_blur)" clipPath="url(#clip)">
      {/* rx 값을 줄여서 더 둥글게 만듭니다. */}
      <Ellipse cx="50" cy="0" rx="45" ry="35" fill={UI_COLORS.lightBeam} />
    </G>
  </Svg>
));

// --- 메인 밝기 화면 컴포넌트 ---
function BrightnessScreen() {
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState(0); // 0-100

  const animation = useRef(new Animated.Value(0)).current;
  const switchStateAnim = useRef(new Animated.Value(0)).current;

  // 모든 애니메이션을 하나의 useEffect에서 제어
  useEffect(() => {
    // 목표값 설정: isOn이 true이면 밝기 값을, false이면 0을 목표로 함
    const targetValue = isOn ? brightness / 100 : 0;

    // 두 애니메이션을 동시에 실행
    Animated.parallel([
      Animated.timing(animation, {
        toValue: targetValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(switchStateAnim, {
        toValue: isOn ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      })
    ]).start();
  }, [isOn, brightness]); // isOn 또는 brightness가 변경될 때마다 실행


  const handleToggle = () => {
    const newIsOn = !isOn;
    setIsOn(newIsOn);
    if (newIsOn && brightness === 0) {
      setBrightness(30);
    } else if (!newIsOn) {
      setBrightness(0);
    }
  };
  const handleSliderChange = (value: number) => {
    setBrightness(value);
    if (value > 0 && !isOn) setIsOn(true);
    else if (value === 0 && isOn) setIsOn(false);
  };

  const glowScale = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1.5] });
  const glowOpacity = animation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.5, 1] });
  // glowOpacity를 glowCenterOpacity로 변경하여 그라데이션을 직접 제어
  const glowCenterOpacity = animation.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.2, 0.5] });
  const thumbTranslateX = switchStateAnim.interpolate({ inputRange: [0, 1], outputRange: [4, 42] });
  const lampGlowOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });
  const lightBeamOpacity = animation.interpolate({ inputRange: [0, 0.3], outputRange: [0, 0.25], extrapolate: 'clamp' });
  const switchBgColor = animation.interpolate({ inputRange: [0, 0.01], outputRange: [UI_COLORS.switchTrackOff, UI_COLORS.switchTrackOn] });

  return (
    <View style={styles.container}>
      {/* 배경 빛 효과 */}
      <Animated.View style={[styles.glowContainer, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}>
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient id="grad">
              <AnimatedStop offset="0" stopColor={UI_COLORS.glowCenter} stopOpacity={glowCenterOpacity} />
              <Stop offset="1" stopColor={UI_COLORS.glowEdge} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill="url(#grad)" />
        </Svg>
      </Animated.View>
      
      {/* 램프 이미지 및 효과 */}
      <View style={styles.lampContainer}>
        <Image source={require('@/assets/lamp.png')} style={styles.lampImage} />
        <Animated.Image source={require('@/assets/lamp.png')} style={[styles.lampImage, styles.lampOverlay, { opacity: lampGlowOpacity }]} />
      </View>

      {/* 빛 줄기 효과 (램프와 분리하여 독립적으로 위치 제어) */}
      <Animated.View style={[styles.lightBeam, { opacity: lightBeamOpacity }]}>
          <LightBeamEffect />
      </Animated.View>

      {/* 컨트롤 UI */}
      <View style={styles.controlsContainer}>
        <Text style={styles.title}>SMART WINDOW Light</Text>
        
        <View style={styles.switchRow}>
          <Pressable onPress={handleToggle}>
            <Animated.View style={[styles.switchTrack, { backgroundColor: switchBgColor }]}>
              <Animated.View style={[styles.switchThumbWrapper, { transform: [{ translateX: thumbTranslateX }] }]}>
                <ToggleThumb isOn={isOn} />
              </Animated.View>
            </Animated.View>
          </Pressable>
          <Text style={styles.switchLabel}>{isOn ? 'ON' : 'OFF'}</Text>
        </View>

        {isOn && (
          <Animated.View style={[styles.sliderContainer, { opacity: animation }]}>
            <Text style={styles.sliderLabel}>Light Intensity</Text>
            <View style={styles.sliderWrapper}>
              <Icons8Light opacity={0.3} />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={brightness}
                onValueChange={handleSliderChange}
                // 채워진 트랙과 손잡이를 모두 흰색으로 변경하여 시인성을 극대화합니다.
                minimumTrackTintColor={COLORS.white}
                maximumTrackTintColor={UI_COLORS.switchTrackOff}
                thumbTintColor={COLORS.white}
              />
              <Icons8Light opacity={1} />
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center' },
  glowContainer: { width: width * 1.2, height: width * 1.2, position: 'absolute', top: 50 }, // 여기 top 값을 120에서 50으로 줄여 위로 이동시킵니다.
  lampContainer: { width: 199, height: 327, position: 'absolute', top: 0, alignItems: 'center' }, // 램프 위치 상향 조정 (사용자 수정 반영)
  lampImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  lampOverlay: { position: 'absolute', tintColor: UI_COLORS.lampOverlay },
  lightBeam: { position: 'absolute', width: 80, height: 40, top: 280, left: (width - 80) / 2 }, // 크기를 절반으로 줄이고 위치 조정
  controlsContainer: { position: 'absolute', top: 420, left: 36, right: 36, },
  title: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '500', marginBottom: 30 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchTrack: { width: 70, height: 28, borderRadius: 23, justifyContent: 'center', paddingHorizontal: 4 },
  switchThumbWrapper: {
    width: 20,
    height: 20,
    // justifyContent, alignItems 추가하여 중앙 정렬
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '500', marginLeft: 10, width: 40 },
  sliderContainer: { width: '100%', marginTop: 40 },
  sliderLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '500' },
  sliderWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 },
  slider: { 
    flex: 1, 
    height: 40, 
    marginHorizontal: 5,
  },
  // thumbContainer 스타일 (thumbImage를 사용할 경우)
  // thumbContainer: {
  //   width: 24,
  //   height: 24,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
});

export default BrightnessScreen;
