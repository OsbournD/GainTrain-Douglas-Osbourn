import { Tabs } from 'expo-router';

export default function AppLayout() {

  return (
    <Tabs
        screenOptions={{
            headerShown: false
        }}>

        <Tabs.Screen name = "dashboard" options = {{ title: "Dashboard"}} />
        <Tabs.Screen name = "profile" options = {{ title: "Profile"}} />
        <Tabs.Screen name = "community" options = {{ title: "Community"}} />
        <Tabs.Screen name = "friends" options = {{ title: "Friends"}} />

    </Tabs>
  );
}