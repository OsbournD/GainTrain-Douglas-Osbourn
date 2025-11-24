import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
      const registerForPush = async () => {
          const { status: existingStatus } = await Notifications.getPermissionsAsync(); // check current permission status.
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
              const { status } = await Notifications.requestPermissionsAsync(); // if not granted, request again.
              finalStatus = status;
          }

          if (finalStatus !== 'granted') {
              console.log("Notification permissions not granted."); // if still not granted, stop.
              return;
          }

          const tokenData = await Notifications.getExpoPushTokenAsync(); // get expo push token.
          console.log("Expo push token: ", tokenData.data);
      }

      registerForPush();

  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
