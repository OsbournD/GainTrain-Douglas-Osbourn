import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
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
                <View style = { styles.headerRow }>
                    <View style = { styles.leftButton }>
                        <Button title = "Log Out" onPress = { logoutClicked }/>
                    </View>
                    <View style = { styles.centerTitle } >
                        <ThemedText type="title">GainTrain!</ThemedText>
                    </View>
                    <View style = { styles.rightButton }>
                        <Button title = "Settings" onPress = { () => console.log("Settings button clicked") }/>
                    </View>
                </View>
            </ThemedView>

            <View style = { styles.spacer }/>

            <ThemedView style = { styles.card }>
                <ThemedText type = "title">Welcome, {username}</ThemedText>
                <ThemedText type = "default"> You've successfully logged in to GainTrain! </ThemedText>
            </ThemedView>

            <ThemedView style = { styles.card }>
                <ThemedText type = "subtitle">Recently You...</ThemedText>
                <ThemedText type = "default">Logged 3 workouts</ThemedText>
                <ThemedText type = "default">Made 2 new friends</ThemedText>
                <ThemedText type = "default">Hit a PR of 75kg for 6 reps on Barbell Bench Press</ThemedText>
            </ThemedView>

            <ThemedView style = { styles.card }>
                <ThemedText type = "subtitle">Smart Suggestions</ThemedText>
                <TouchableOpacity style = { styles.suggestionCard } onPress = { () => console.log("Smart suggestion clicked")} >
                    <Text style = { styles.suggestionText }> Barbell Romanian Deadlift </Text>
                </TouchableOpacity>
                <TouchableOpacity style = { styles.suggestionCard } onPress = { () => console.log("Smart suggestion clicked")} >
                    <Text style = { styles.suggestionText }> Lying Leg Curl </Text>
                </TouchableOpacity>
            </ThemedView>


            <TouchableOpacity style = { styles.primaryButton } onPress = { () => console.log("Start workout clicked")} >
                <Text style = { styles.primaryButtonText }> Start Workout </Text>
            </TouchableOpacity>
            <View style = { styles.buttonRow }>
                <TouchableOpacity style = { styles.secondaryButton } onPress = { () => console.log("Workout diary clicked")} >
                    <Text style = { styles.buttonText }> Workout Diary </Text>
                </TouchableOpacity>
                <TouchableOpacity style = { styles.secondaryButton } onPress = { () => console.log("Exercise discovery clicked")} >
                    <Text style = { styles.buttonText }>Exercise Discovery</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        height: 120,
        justifyContent: 'center',
        backgroundColor: '#94C8FF',
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    leftButton: {
        flex: 1,
    },
    centerTitle: {
        flex: 2,
        alignItems: 'center',
    },
    rightButton: {
        flex: 1,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 20,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    suggestionCard: {
        backgroundColor: '#C47CF8',
        padding: 10,
        marginTop: 8,
        borderRadius: 16,
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    suggestionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    primaryButton: {
        backgroundColor: '#3EEF7C',
        paddingVertical: 28,
        borderRadius: 20,
        marginTop: 16,
        marginVertical: 8,
        marginHorizontal: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    secondaryButton: {
        backgroundColor: '#46C3F3',
        paddingVertical: 34,
        flex: 1,
        borderRadius: 20,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    spacer: {
        height: 20,
    },
});
