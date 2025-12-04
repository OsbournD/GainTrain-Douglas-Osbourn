import { Tabs } from 'expo-router';

export default function AppLayout() {

  return (
    <Tabs
        screenOptions={{
            headerShown: false
        }}>

        <Tabs.Screen name = "dashboard" options = {{ title: "Dashboard"}} />
        <Tabs.Screen name = "friends" options = {{ title: "Friends"}} />

    </Tabs>
  );
}