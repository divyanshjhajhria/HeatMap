/**
 * Home Screen - Main map view with heatmap overlay
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, HeatmapCell } from '../types';
import { getHeatmap } from '../services/api';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

// Default to Paris coordinates
const PARIS_CENTER = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [cityId] = useState(1); // Paris city ID

  useEffect(() => {
    loadHeatmap();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadHeatmap = async () => {
    try {
      setLoading(true);
      const data = await getHeatmap(cityId);
      setHeatmapCells(data.cells || []);
    } catch (error) {
      console.error('Error loading heatmap:', error);
      Alert.alert('Error', 'Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (score: number): string => {
    // Convert score (0-100) to color gradient
    // Red for high scores, yellow for medium, green for low
    if (score >= 70) return 'rgba(255, 0, 0, 0.6)'; // Red
    if (score >= 40) return 'rgba(255, 165, 0, 0.5)'; // Orange
    return 'rgba(0, 255, 0, 0.3)'; // Green
  };

  const renderHeatmapOverlay = () => {
    // For simplicity, we'll render markers for each cell
    // In production, you'd use a proper heatmap library or custom overlay
    return heatmapCells.map((cell, index) => {
      const color = getHeatColor(cell.score);
      return (
        <Marker
          key={cell.h3Index}
          coordinate={{ latitude: cell.lat, longitude: cell.lng }}
          pinColor={cell.score >= 70 ? 'red' : cell.score >= 40 ? 'orange' : 'green'}
          opacity={0.6}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={PARIS_CENTER}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {renderHeatmapOverlay()}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading heatmap...</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Achievements', { userId: 1 })}
        >
          <Text style={styles.buttonText}>Achievements</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

