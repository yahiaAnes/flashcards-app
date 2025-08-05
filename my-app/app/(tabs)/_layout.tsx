import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function Layout() {
  const router = useRouter();
    const { user } = useAuth();
    useEffect(() => {
      if (!user) {
        router.replace('/(auth)/login');
      }
    }, [user, router]);

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#1E1E2F', // Changed background to a deep navy-blue
          borderTopWidth: 0,
          position: 'absolute',
          borderRadius: 20,
          marginHorizontal: 16,
          marginBottom: 30,
          paddingBottom: 12,
          paddingTop: 10,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 12,
          opacity: 0.7, 
          //backdropFilter: 'blur(100px)', 
          zIndex: 100, 
          
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#FF79C6', // Pinkish active color
        tabBarInactiveTintColor: '#6272A4', // Muted blue-ish inactive color
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          title: 'Cards',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'layers' : 'layers-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Tools',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'rocket' : 'rocket-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="createCards"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'plus-box' : 'plus-box-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
