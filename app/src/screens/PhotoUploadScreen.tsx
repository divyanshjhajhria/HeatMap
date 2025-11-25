/**
 * Photo Upload Screen - Upload photos with caption, tags, and privacy settings
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { uploadPhoto } from '../services/api';

type PhotoUploadScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PhotoUpload'
>;
type PhotoUploadScreenRouteProp = RouteProp<RootStackParamList, 'PhotoUpload'>;

interface Props {
  navigation: PhotoUploadScreenNavigationProp;
  route: PhotoUploadScreenRouteProp;
}

const PhotoUploadScreen: React.FC<Props> = ({ route, navigation }) => {
  const { placeId } = route.params;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userId] = useState(1); // Mock user ID

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select or take a photo first');
      return;
    }

    setUploading(true);
    try {
      // In production, upload to S3 first, then save URL
      // For now, using the local URI as a placeholder
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await uploadPhoto(
        userId,
        placeId,
        imageUri, // In production, this would be S3 URL
        caption || undefined,
        tagsArray.length > 0 ? tagsArray : undefined,
        isPublic
      );

      Alert.alert('Success', 'Photo uploaded!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload Memory</Text>

        {!imageUri ? (
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.pickerButton} onPress={pickImage}>
              <Text style={styles.pickerButtonText}>📷 Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickerButton} onPress={takePhoto}>
              <Text style={styles.pickerButtonText}>📸 Take Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Text style={styles.imageSelectedText}>✓ Image selected</Text>
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={() => setImageUri(null)}
            >
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Caption (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Add a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={200}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tags (comma-separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., sunset, friends, travel"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        <View style={styles.formGroup}>
          <TouchableOpacity
            style={styles.privacyButton}
            onPress={() => setIsPublic(!isPublic)}
          >
            <Text style={styles.privacyButtonText}>
              {isPublic ? '🌐 Public' : '🔒 Private'}
            </Text>
            <Text style={styles.privacySubtext}>
              {isPublic
                ? 'Others can see this photo'
                : 'Only you can see this photo'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading || !imageUri}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  imagePickerContainer: {
    gap: 15,
    marginBottom: 20,
  },
  pickerButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  pickerButtonText: {
    fontSize: 18,
    color: '#6200ee',
    fontWeight: '600',
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  imageSelectedText: {
    fontSize: 16,
    color: '#4caf50',
    marginBottom: 10,
  },
  changeImageButton: {
    padding: 10,
  },
  changeImageText: {
    color: '#6200ee',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 50,
  },
  privacyButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  privacyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  privacySubtext: {
    fontSize: 14,
    color: '#666',
  },
  uploadButton: {
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PhotoUploadScreen;

