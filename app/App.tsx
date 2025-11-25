/**
 * HeatGuide App - Main entry point
 * React Native app with Expo for HeatGuide mobile application
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import PlaceDetailsScreen from './src/screens/PlaceDetailsScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'HeatGuide' }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

