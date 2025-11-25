/**
 * Reel Feed Screen - Instagram/TikTok style vertical scrolling feed
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Photo } from '../types';
import { getPlaceFeed } from '../services/api';
import { useTheme } from '../context/ThemeContext';

type ReelFeedScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReelFeed'
>;
type ReelFeedScreenRouteProp = RouteProp<RootStackParamList, 'ReelFeed'>;

interface Props {
  navigation: ReelFeedScreenNavigationProp;
  route: ReelFeedScreenRouteProp;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ReelFeedScreen: React.FC<Props> = ({ navigation }) => {
  const [reels, setReels] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { theme, isDark } = useTheme();
  const [visitedPlaces] = useState([1]); // Manchester city ID

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      setLoading(true);
      // Load photos from all places
      const feeds = await Promise.all(
        visitedPlaces.map((placeId) => getPlaceFeed(placeId))
      );
      const allPhotos = feeds.flatMap((f) => f.photos || []);
      // Sort by timestamp (newest first)
      allPhotos.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setReels(allPhotos);
    } catch (error) {
      console.error('Error loading reels:', error);
      Alert.alert('Error', 'Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderReel = ({ item, index }: { item: Photo; index: number }) => {
    const styles = createStyles(theme, isDark);
    const isActive = index === currentIndex;

    return (
      <View style={styles.reelContainer}>
        <Image
          source={{ uri: item.s3_path }}
          style={styles.reelImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.content}>
            {item.caption && (
              <Text style={styles.caption} numberOfLines={3}>
                {item.caption}
              </Text>
            )}
            <View style={styles.metaContainer}>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleDateString()}
              </Text>
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {item.tags.slice(0, 3).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={createStyles(theme, isDark).loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={createStyles(theme, isDark).loadingText}>Loading reels...</Text>
      </View>
    );
  }

  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderReel}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reels yet</Text>
            <Text style={styles.emptySubtext}>
              Check in at places and upload photos to see them here!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.textSecondary,
  },
  reelContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  reelImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    marginTop: 'auto',
  },
  caption: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default ReelFeedScreen;

