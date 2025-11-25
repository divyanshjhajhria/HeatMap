/**
 * Nearby Chat Screen - Find and join nearby chat rooms
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { RootStackParamList, ChatRoom } from '../types';
import { getNearbyChatRooms } from '../services/api';

type NearbyChatScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NearbyChat'
>;
type NearbyChatScreenRouteProp = RouteProp<RootStackParamList, 'NearbyChat'>;

interface Props {
  navigation: NearbyChatScreenNavigationProp;
  route: NearbyChatScreenRouteProp;
}

const NearbyChatScreen: React.FC<Props> = ({ navigation }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    requestLocationAndLoadChats();
  }, []);

  const requestLocationAndLoadChats = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const loc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(loc);
        await loadNearbyChats(loc.latitude, loc.longitude);
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby chats');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location');
      setLoading(false);
    }
  };

  const loadNearbyChats = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const data = await getNearbyChatRooms(lat, lng, 500);
      setChatRooms(data.chatRooms || []);
    } catch (error) {
      console.error('Error loading nearby chats:', error);
      Alert.alert('Error', 'Failed to load nearby chat rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userLocation) {
      await loadNearbyChats(userLocation.latitude, userLocation.longitude);
    } else {
      await requestLocationAndLoadChats();
    }
  };

  const handleJoinRoom = (room: ChatRoom) => {
    navigation.navigate('ChatRoom', {
      roomId: room.id,
      roomName: room.name,
    });
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.chatRoomCard}
      onPress={() => handleJoinRoom(item)}
    >
      <View style={styles.chatRoomHeader}>
        <Text style={styles.chatRoomName}>{item.name}</Text>
        {item.active_users !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.active_users} active</Text>
          </View>
        )}
      </View>
      {item.description && (
        <Text style={styles.chatRoomDescription}>{item.description}</Text>
      )}
      {item.place_name && (
        <Text style={styles.placeName}>📍 {item.place_name}</Text>
      )}
      {item.message_count !== undefined && (
        <Text style={styles.messageCount}>
          {item.message_count} {item.message_count === 1 ? 'message' : 'messages'}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Finding nearby chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Chats</Text>
        <Text style={styles.subtitle}>
          Chat with people nearby or at places you visit
        </Text>
      </View>

      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No nearby chat rooms</Text>
            <Text style={styles.emptySubtext}>
              Check in at places to create chat rooms!
            </Text>
          </View>
        }
      />
    </View>
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
  listContent: {
    padding: 15,
  },
  chatRoomCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatRoomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chatRoomDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 14,
    color: '#6200ee',
    marginBottom: 4,
  },
  messageCount: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default NearbyChatScreen;

