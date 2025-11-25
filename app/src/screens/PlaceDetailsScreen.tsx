/**
 * Place Details Screen - Show place information and allow check-in
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Place } from '../types';
import { getPlace, checkIn } from '../services/api';

type PlaceDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlaceDetails'
>;
type PlaceDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PlaceDetails'>;

interface Props {
  navigation: PlaceDetailsScreenNavigationProp;
  route: PlaceDetailsScreenRouteProp;
}

const PlaceDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { placeId } = route.params;
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [userId] = useState(1); // Mock user ID

  useEffect(() => {
    loadPlaceDetails();
    requestLocationPermission();
  }, [placeId]);

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

  const loadPlaceDetails = async () => {
    try {
      setLoading(true);
      const data = await getPlace(placeId);
      setPlace(data);
    } catch (error) {
      console.error('Error loading place:', error);
      Alert.alert('Error', 'Failed to load place details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!userLocation || !place) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      setCheckingIn(true);
      const result = await checkIn(
        userId,
        place.id,
        userLocation.latitude,
        userLocation.longitude
      );

      if (result.success) {
        Alert.alert('Success', 'Checked in successfully!');
      }
    } catch (error: any) {
      console.error('Error checking in:', error);
      const errorMessage =
        error.response?.data?.error || 'Failed to check in';
      Alert.alert('Error', errorMessage);
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading place details...</Text>
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Place not found</Text>
      </View>
    );
  }

  const region = {
    latitude: place.lat,
    longitude: place.lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.name}
            description={place.category}
          />
        </MapView>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.category}>{place.category}</Text>
        {place.city_name && (
          <Text style={styles.city}>{place.city_name}</Text>
        )}

        <TouchableOpacity
          style={[styles.checkInButton, checkingIn && styles.checkInButtonDisabled]}
          onPress={handleCheckIn}
          disabled={checkingIn}
        >
          {checkingIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkInButtonText}>Check In</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  mapContainer: {
    height: 300,
    width: '100%',
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  category: {
    fontSize: 18,
    color: '#6200ee',
    marginBottom: 4,
  },
  city: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  checkInButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  checkInButtonDisabled: {
    opacity: 0.6,
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlaceDetailsScreen;

