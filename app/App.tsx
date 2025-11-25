/**
 * UoM Guide App - Main entry point
 * University of Manchester student guide app
 */

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import PlaceDetailsScreen from './src/screens/PlaceDetailsScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import TimeVaultScreen from './src/screens/TimeVaultScreen';
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import NearbyChatScreen from './src/screens/NearbyChatScreen';
import SocialFeedScreen from './src/screens/SocialFeedScreen';
import ReelFeedScreen from './src/screens/ReelFeedScreen';
import PhotoUploadScreen from './src/screens/PhotoUploadScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, loading } = useAuth();

  const navigationTheme = isDark ? DarkTheme : DefaultTheme;
  navigationTheme.colors.primary = theme.primary;
  navigationTheme.colors.background = theme.background;
  navigationTheme.colors.card = theme.card;
  navigationTheme.colors.text = theme.text;
  navigationTheme.colors.border = theme.border;

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'UoM Guide' }}
            />
        <Stack.Screen 
          name="PlaceDetails" 
          component={PlaceDetailsScreen}
          options={{ title: 'Place Details' }}
        />
        <Stack.Screen 
          name="Achievements" 
          component={AchievementsScreen}
          options={{ title: 'Achievements' }}
        />
        <Stack.Screen 
          name="TimeVault" 
          component={TimeVaultScreen}
          options={{ title: 'Time Vault' }}
        />
        <Stack.Screen 
          name="ChatRoom" 
          component={ChatRoomScreen}
          options={({ route }) => ({ title: route.params.roomName || 'Chat' })}
        />
        <Stack.Screen 
          name="NearbyChat" 
          component={NearbyChatScreen}
          options={{ title: 'Nearby Chats' }}
        />
        <Stack.Screen 
          name="SocialFeed" 
          component={SocialFeedScreen}
          options={{ title: 'Social Feed' }}
        />
            <Stack.Screen 
              name="ReelFeed" 
              component={ReelFeedScreen}
              options={{ 
                title: 'Reels',
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen 
              name="PhotoUpload" 
              component={PhotoUploadScreen}
              options={{ title: 'Upload Photo' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

