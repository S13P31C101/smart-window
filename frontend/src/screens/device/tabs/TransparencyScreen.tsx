import React from 'react';
import { StyleSheet, Text, View, Switch, ImageBackground } from 'react-native';

function TransparencyScreen() {
  const [isTransparent, setIsTransparent] = React.useState(true);

  return (
    <ImageBackground
      source={require('@/assets/bgimage.jpeg')}
      style={styles.container}
      // '불투명' 상태일 때 (isTransparent가 false) 배경 이미지에 블러 효과를 줍니다.
      blurRadius={isTransparent ? 0 : 15}
    >
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isTransparent ? '선명한 창' : '흐릿한 창'}
        </Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <Text style={styles.controlTitle}>창문 투명도</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {isTransparent ? '투명' : '불투명'}
          </Text>
          <Switch
            onValueChange={setIsTransparent}
            value={isTransparent}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isTransparent ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  controlsContainer: {
    // 하단 컨트롤은 여기에 위치
  },
  controlTitle: {
    color: '#E0E5EB',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0E5EB',
    marginHorizontal: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
});

export default TransparencyScreen;
