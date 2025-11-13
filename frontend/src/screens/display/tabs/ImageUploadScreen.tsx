import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';

function ImageUploadScreen() {
  const [imageName, setImageName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri || null);
      }
    });
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
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
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

      <TouchableOpacity style={styles.submitButton} disabled={!imageName || !selectedImage}>
        <Icon name="cloud-upload-outline" size={20} color="#FFF" />
        <Text style={styles.submitButtonText}>등록하기</Text>
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
    opacity: 0.8,
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
