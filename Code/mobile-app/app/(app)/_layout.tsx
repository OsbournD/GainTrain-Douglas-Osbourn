import { Tabs, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
    const router = useRouter();
    const [checkingLogin, setCheckingLogin] = useState(true);

    useEffect(() => {
        const checkLogin = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            if (!storedUser) {
                router.replace('/(auth)/login');
                return;
            }
            setCheckingLogin(false);
        };
        checkLogin();
    }, []);

    if (checkingLogin) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Tabs
            screenOptions={{
            headerShown: false
        }}>

            <Tabs.Screen
                name = "dashboard"
                options = {{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size = { size } color = { color } />
                    ),
                }}
            />
            <Tabs.Screen
                name = "community"
                options = {{
                    title: "Community",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size = { size } color = { color } />
                    ),
                }}
            />

        </Tabs>
    );
}