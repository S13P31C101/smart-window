import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import {
  useRequestMediaUploadUrl,
  useRegisterMedia,
  MediaUploadRequest,
} from '@/api/media';
import { useQueryClient } from '@tanstack/react-query';

function ImageUploadScreen() {
  const [imageName, setImageName] = useState('');
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();
  const requestUrlMutation = useRequestMediaUploadUrl();
  const registerMediaMutation = useRegisterMedia();

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0]);
        if (!imageName && response.assets[0].fileName) {
          setImageName(response.assets[0].fileName.split('.')[0]);
        }
      }
    });
  };

  const handleUpload = async () => {
    if (!selectedImage || !selectedImage.uri || !selectedImage.fileName || !selectedImage.type) {
      Alert.alert('오류', '이미지 정보가 올바르지 않습니다.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. 업로드 URL 요청
      console.log('1. 업로드 URL 요청 시작...');
      const mediaData: MediaUploadRequest = {
        fileName: selectedImage.fileName,
        fileType: 'IMAGE',
      };
      console.log('업로드 URL 요청 데이터:', mediaData);
      const uploadUrlResponse = await requestUrlMutation.mutateAsync(mediaData);
      console.log('2. 업로드 URL 받기 성공:', uploadUrlResponse);

      if (!uploadUrlResponse || !uploadUrlResponse.s3ObjectKey || !uploadUrlResponse.fileUrl) {
        throw new Error('업로드 URL 응답이 예상과 다릅니다.');
      }

      const { s3ObjectKey, fileUrl } = uploadUrlResponse;

      // 2. 이미지 파일을 Blob 형태로 변환
      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();
      console.log('3. 이미지 파일을 Blob으로 변환 성공');

      // 3. S3에 파일 업로드 (PUT 요청)
      console.log('4. S3에 업로드 시작...');
      const uploadResponse = await fetch(fileUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedImage.type,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 업로드 실패: ${uploadResponse.status}`);
      }
      console.log('5. S3 업로드 성공');

      // 4. 백엔드에 등록 완료 보고
      console.log('6. 백엔드에 미디어 등록 시작...');
      const registerPayload = {
        s3ObjectKey: s3ObjectKey,
        fileName: imageName,
        fileType: 'IMAGE' as const, // 'IMAGE' 타입을 명확히 해줍니다.
        fileSize: selectedImage.fileSize || 0,
        resolution:
          selectedImage.width && selectedImage.height
            ? `${selectedImage.width}x${selectedImage.height}`
            : null,
      };
      // 등록 요청으로 보낼 데이터를 콘솔에 출력합니다.
      console.log('미디어 등록 요청 데이터:', registerPayload);
      
      const registerResponse = await registerMediaMutation.mutateAsync(registerPayload);

      // 등록 성공 후 백엔드로부터 받은 응답을 콘솔에 출력합니다.
      console.log('7. 미디어 등록 성공:', registerResponse);

      Alert.alert('성공', '이미지가 성공적으로 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['myMedia'] }); // 보관함 목록 갱신
      // 초기화
      setImageName('');
      setSelectedImage(null);

    } catch (error) {
      // --- 이 부분을 아래와 같이 수정해주세요 ---
      console.error('이미지 업로드 중 오류 발생! 상세 정보:', error);
      console.error('에러 객체 전체 출력:', JSON.stringify(error, null, 2));
      Alert.alert('오류', '이미지 등록 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>이미지 이름 *</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 제주도 풍경"
          placeholderTextColor="#8291AC"
          value={imageName}
          onChangeText={setImageName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>이미지 선택 *</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={handleChoosePhoto}>
          {selectedImage?.uri ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          ) : (
            <>
              <Icon name="image-outline" size={80} color="#8291AC" />
              <Text style={styles.imagePickerText}>이미지를 선택해주세요</Text>
              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>파일 선택</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, (!imageName || !selectedImage || isUploading) && styles.disabledButton]} 
        disabled={!imageName || !selectedImage || isUploading}
        onPress={handleUpload}
      >
        {isUploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Icon name="cloud-upload-outline" size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>등록하기</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 이미지를 등록하면 자동으로 AI가 배경 생성과 동영상 생성을 진행합니다. 완료되면 "보관" 탭에서 확인할 수 있습니다.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2F4D',
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#E0E5EB',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2D4A6E',
    borderRadius: 8,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4A5E7E',
  },
  imagePicker: {
    height: 250,
    backgroundColor: '#2D4A6E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    color: '#8291AC',
    marginTop: 16,
    fontSize: 16,
  },
  selectButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: 'rgba(45, 74, 110, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    color: '#B0C4DE',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ImageUploadScreen;
