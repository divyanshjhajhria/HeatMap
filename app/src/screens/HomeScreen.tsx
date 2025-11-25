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
import { RootStackParamList, HeatmapCell, Place } from '../types';
import { getHeatmap, getCityPlaces } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

// Default to Manchester/University of Manchester coordinates
const MANCHESTER_CENTER = {
  latitude: 53.4808,
  longitude: -2.2426,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [cityId] = useState(1); // Manchester city ID
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [totalVisits, setTotalVisits] = useState<number | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const { theme, isDark } = useTheme();
  const { user, logout } = useAuth();
  
  const styles = createStyles(theme, isDark);

  useEffect(() => {
    loadHeatmap();
    loadPlaces();
    requestLocationPermission();
  }, [selectedDate]);

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
      const data = await getHeatmap(cityId, selectedDate, false);
      setHeatmapCells(data.cells || []);
      setTotalVisits(data.totalVisits || null);
      console.log(`📊 Loaded ${data.count} heatmap cells${selectedDate ? ` for ${selectedDate}` : ''}`);
      if (data.totalVisits) {
        console.log(`👥 Total visits: ${data.totalVisits}`);
      }
    } catch (error) {
      console.error('Error loading heatmap:', error);
      Alert.alert('Error', 'Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlaces = async () => {
    try {
      const data = await getCityPlaces(cityId);
      setPlaces(data.places || []);
    } catch (error) {
      console.error('Error loading places:', error);
    }
  };

  const getHeatColor = (score: number): string => {
    // Convert score (0-100) to color gradient based on footfall
    // Red = High footfall (70-100), Orange = Medium (40-69), Green = Low (0-39)
    if (score >= 70) return 'rgba(255, 0, 0, 0.7)'; // Red - High footfall
    if (score >= 40) return 'rgba(255, 165, 0, 0.6)'; // Orange - Medium footfall
    return 'rgba(0, 255, 0, 0.4)'; // Green - Low footfall
  };
  
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const handleDateChange = (date: string | undefined) => {
    setSelectedDate(date);
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
        initialRegion={MANCHESTER_CENTER}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {renderHeatmapOverlay()}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.name}
            description={place.category}
            pinColor={theme.primary}
            onPress={() => navigation.navigate('PlaceDetails', { placeId: place.id })}
          />
        ))}
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
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading heatmap...</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        {totalVisits !== null && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              👥 {totalVisits} visits{selectedDate ? ` on ${selectedDate}` : ' (all time)'}
            </Text>
          </View>
        )}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#E50914' }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B00' }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#00C853' }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleDateChange(selectedDate ? undefined : getTodayDate())}
        >
          <Text style={styles.buttonText}>
            {selectedDate ? 'Show All Time' : 'Show Today'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('Achievements', { userId: 1 })}
        >
          <Text style={styles.buttonText}>🏆 Achievements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonTertiary]}
          onPress={() => navigation.navigate('NearbyChat')}
        >
          <Text style={styles.buttonText}>💬 Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonQuaternary]}
          onPress={() => navigation.navigate('ReelFeed')}
        >
          <Text style={styles.buttonText}>🎬 Reels</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonQuinary]}
          onPress={() => navigation.navigate('SocialFeed')}
        >
          <Text style={styles.buttonText}>📱 Feed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    backgroundColor: isDark ? 'rgba(10, 10, 10, 0.9)' : 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.text,
  },
  infoContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    letterSpacing: 0.3,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: theme.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: theme.primaryDark,
  },
  buttonTertiary: {
    backgroundColor: '#E50914',
  },
  buttonQuaternary: {
    backgroundColor: '#00A8E1',
  },
  buttonQuinary: {
    backgroundColor: '#1DB954',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default HomeScreen;

