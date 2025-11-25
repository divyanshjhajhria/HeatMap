/**
 * Time Vault Screen - View photos at a place (your photos + public photos)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Photo } from '../types';
import { getPlacePhotos } from '../services/api';

type TimeVaultScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TimeVault'
>;
type TimeVaultScreenRouteProp = RouteProp<RootStackParamList, 'TimeVault'>;

interface Props {
  navigation: TimeVaultScreenNavigationProp;
  route: TimeVaultScreenRouteProp;
}

const TimeVaultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { placeId } = route.params;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(1); // Mock user ID

  useEffect(() => {
    loadPhotos();
  }, [placeId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await getPlacePhotos(placeId, userId);
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading time vault...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time Vault</Text>
        <Text style={styles.subtitle}>
          {photos.length} {photos.length === 1 ? 'memory' : 'memories'} at this place
        </Text>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>
            Be the first to add a memory here!
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('PhotoUpload', { placeId })}
          >
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.photosGrid}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoCard}>
              <Image
                source={{ uri: photo.s3_path }}
                style={styles.photo}
              />
              {photo.caption && (
                <Text style={styles.caption}>{photo.caption}</Text>
              )}
              <Text style={styles.timestamp}>
                {new Date(photo.timestamp).toLocaleDateString()}
              </Text>
              {photo.tags && photo.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {photo.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PhotoUpload', { placeId })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    paddingHorizontal: 30,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photosGrid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photo: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  caption: {
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  timestamp: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    fontSize: 12,
    color: '#999',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    paddingTop: 0,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default TimeVaultScreen;

