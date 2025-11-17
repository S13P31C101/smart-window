import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Rive, { Fit, Alignment } from 'rive-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// TODO: 네비게이션 스택에 맞는 타입으로 수정해야 할 수 있습니다.
type RootStackParamList = {
  Main: undefined; // 'Main'은 실제 메인 화면 라우트 이름으로 변경해주세요.
};

const RiveSplashScreen = () => {
  // useNavigation hook의 제네릭 타입을 수정합니다.
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    // 애니메이션 재생 시간(약 2.5초)이 지난 후 메인 화면으로 이동합니다.
    const timer = setTimeout(() => {
      // TODO: 'Main'을 실제 메인 화면 라우트 이름으로 변경해주세요.
      navigation.replace('Main'); 
    }, 2500); 

    return () => clearTimeout(timer); // 컴포넌트가 언마운트되면 타이머를 정리합니다.
  }, [navigation]);

  return (
    <Rive
      // resourceName은 'res/raw'에 넣은 파일명 (확장자 제외)
      resourceName="splashscreen"
      style={styles.riveContainer}
      fit={Fit.Cover}
      alignment={Alignment.Center}
      autoplay={true}
    />
  );
};

const styles = StyleSheet.create({
  riveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default RiveSplashScreen;