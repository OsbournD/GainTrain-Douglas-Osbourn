import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sign Up',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
            title: 'Login',
        }}
      />
      <Tabs.Screen
        name="firebaseTest"
        options={{
            title: 'firebaseTest',
            tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
            title: 'Dashboard',
            tabBarButton: () => null,
        }}
      />

    </Tabs>
  );
}
