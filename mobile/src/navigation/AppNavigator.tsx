import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AuthScreen from '../screens/AuthScreen';
import ChatsScreen from '../screens/ChatsScreen';
import LearningScreen from '../screens/LearningScreen';
import ProfileScreen from '../screens/ProfileScreen'; 
import PackDetailScreen from '../screens/PackDetailScreen';
import ChatScreen from '../screens/ChatScreen'; // Import ChatScreen
import Icon from 'react-native-vector-icons/FontAwesome';
import { ChatRoom } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: undefined;
  PackDetail: { packId: number };
  Chat: { room: ChatRoom };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Define the main tab navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#666',
      headerShown: false,
      tabBarStyle: {
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    }}>
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Learning" 
      component={LearningScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="graduation-cap" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Chats" 
      component={ChatsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="comments" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="user" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Define the main app navigator
const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="PackDetail" component={PackDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} /> 
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;