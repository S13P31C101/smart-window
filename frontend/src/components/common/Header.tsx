import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@/constants/color';

type HeaderProps = {
  title: string;
  showBackButton?: boolean; // 뒤로가기 버튼 표시 여부
  showProfileButton?: boolean; // 프로필 버튼 표시 여부
};

const Header = ({ title, showBackButton = true, showProfileButton = true }: HeaderProps) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* 1. 뒤로가기 버튼 */}
      <View style={styles.buttonContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
            <Icon name="arrow-back" size={24} color={COLORS.iconPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. 타이틀 */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* 3. 프로필 버튼 */}
      <View style={styles.buttonContainer}>
        {showProfileButton && (
          <TouchableOpacity onPress={() => navigation.navigate('MyPage')} style={styles.button}>
            <Icon name="person-circle-outline" size={28} color={COLORS.iconPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: 40, // 버튼 영역 너비 고정
    alignItems: 'center',
  },
  button: {
    padding: 5,
  },
});

export default Header;