import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '@/stores/authStore';
import { useGetMyInfo, useDeleteMyAccount, useUpdateMyInfo } from '@/api/user';
import { COLORS } from '@/constants/color';
import Header from '@/components/common/Header'; // Header 컴포넌트 import

function MyPageScreen() {
  const logout = useAuthStore(state => state.logout);
  const { data: userInfo, isLoading, error } = useGetMyInfo();
  // useDeleteMyAccount 훅을 호출하여 mutate 함수와 isPending 상태를 가져옵니다.
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteMyAccount();
  const { mutate: updateNickname, isPending: isUpdating } = useUpdateMyInfo();

  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  useEffect(() => {
    if (userInfo?.nickname) {
      setNewNickname(userInfo.nickname);
    }
  }, [userInfo]);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          await logout();
        },
        style: 'destructive',
      },
    ]);
  };

  const handleUpdateNickname = () => {
    if (!newNickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }
    updateNickname(
      { nickname: newNickname },
      {
        onSuccess: () => {
          Alert.alert('성공', '닉네임이 변경되었습니다.');
          setIsEditing(false);
        },
        onError: err => {
          Alert.alert('오류', '닉네임 변경 중 오류가 발생했습니다.');
          console.error(err);
        },
      },
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          onPress: () => {
            // deleteAccount mutate 함수를 호출합니다.
            deleteAccount(undefined, {
              onSuccess: () => {
                Alert.alert('성공', '회원 탈퇴가 완료되었습니다.');
                logout(); // 탈퇴 성공 후 클라이언트에서도 로그아웃 처리
              },
              onError: (err) => {
                Alert.alert('오류', '회원 탈퇴 중 오류가 발생했습니다.');
                console.error(err);
              }
            });
          },
          style: 'destructive',
        },
      ],
    );
  };

  if (isLoading || isDeleting || isUpdating) {
    return <SafeAreaView style={styles.messageContainer}><ActivityIndicator color={COLORS.textPrimary} /></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView style={styles.messageContainer}><Text style={styles.errorText}>사용자 정보를 불러오지 못했습니다.</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 여기에 Header 컴포넌트를 추가합니다. */}
      <Header title="마이페이지" showProfileButton={false} /> 
      
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Icon name="person" size={40} color={COLORS.iconPrimary} />
        </View>
        <View style={styles.profileInfo}>
        {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={newNickname}
                onChangeText={setNewNickname}
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity onPress={handleUpdateNickname}>
                  <Text style={styles.saveButton}>저장</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Text style={styles.cancelButton}>취소</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.nicknameContainer}>
              <Text style={styles.nickname}>{userInfo?.nickname ?? '사용자'}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editIcon}>
                <Icon name="pencil" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.email}>{userInfo?.email ?? '이메일 정보 없음'}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color={COLORS.textSecondary} />
          <Text style={styles.menuText}>로그아웃</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
          <Icon name="trash-outline" size={24} color={COLORS.notification} />
          <Text style={[styles.menuText, styles.deleteText]}>회원 탈퇴</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceCardDark },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
    profileSection: { flexDirection: 'row', alignItems: 'center', padding: 20, },
    avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.surfaceCardDark, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    profileInfo: { flex: 1 },
    nicknameContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    nickname: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    editIcon: { padding: 5 },
    email: { fontSize: 14, color: COLORS.textSecondary },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.textSecondary,
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        paddingBottom: 5,
    },
    editButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    saveButton: {
        color: COLORS.primary,
        marginRight: 15,
        fontWeight: 'bold',
    },
    cancelButton: {
        color: COLORS.textSecondary,
    },
    menuSection: { marginTop: 20 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceCardDark },
    menuText: { fontSize: 16, color: COLORS.textPrimary, marginLeft: 15 },
    deleteText: { color: COLORS.notification },
    messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    errorText: { color: COLORS.notification }
  });

export default MyPageScreen;