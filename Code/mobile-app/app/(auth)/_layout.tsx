import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AuthLayout() {

    return (
        <Tabs
            screenOptions={{
            headerShown: false
        }}>

            <Tabs.Screen
                name = "login"
                options = {{
                    title: "Login",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name = "log-in-outline" size = { size } color = { color } />
                    ),
                }}
            />
            <Tabs.Screen
                name = "signup"
                options = {{
                    title: "Sign Up",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name = "person-add-outline" size = { size } color = { color } />
                    ),
                }}
            />

        </Tabs>
    );
}
