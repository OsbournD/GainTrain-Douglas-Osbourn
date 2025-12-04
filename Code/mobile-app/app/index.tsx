import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { View, ActivityIndicator } from 'react-native';

export default function Index() {

    const router = useRouter();

    useEffect(() => { // redirect based on whether user is logged in.
        const loginCheck = async () => {
            const user = await AsyncStorage.getItem("loggedInUser");

            if (user) {
                router.replace('/(app)/dashboard');
            } else {
                router.replace('/(auth)/login');
            }
        }
        loginCheck();
    }, []);

    return (
        <View style = {{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size = "large"/>
        </View>
    );

}