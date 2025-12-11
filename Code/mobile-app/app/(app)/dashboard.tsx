import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../../src/firestore';
import { useIsFocused } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function welcomeDashboard() {

    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const isFocused = useIsFocused();

    useEffect(() => { // when screen is focused, check for login and load logged in username.

        const checkLogin = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');

            if (!storedUser) {
                router.replace('/(auth)/login');
                return;
            }

            setUsername(storedUser);
            setLoadingUser(false);
        }

        if (isFocused) {
            checkLogin();
        }
    }, [isFocused]);

    if (loadingUser) { // load spinner if checking login.
        return (
            <View style = {{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size = "large" />
            </View>
        )
    }

    const logoutClicked = async () => {
        try {
            await logoutUser();
            await AsyncStorage.removeItem('loggedInUser');
            router.push('/(auth)/login');
        } catch (e) {
            console.error("Logout error: ", e);
        }

    }

    return (

        <View style={{ flex: 1 }}>

            <ThemedView style={styles.headerContainer}>
                <ThemedText type="title">GainTrain!</ThemedText>
            </ThemedView>

            <ThemedView style = { styles.container }>

                <ThemedText type = "title"> Welcome, {username}!</ThemedText>
                <ThemedText type = "default"> You've successfully logged in to GainTrain! </ThemedText>

                <View style = { styles.buttonContainer }>
                    <Button title = "Log Out" onPress = { logoutClicked }/>
                </View>

            </ThemedView>

        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#A1CEDC',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    buttonContainer: {
        marginTop: 20,
    },
});
