import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../../src/firestore';

import { Image } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function welcomeDashboard() {

    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {

        const loadUsername = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');

            setUsername(storedUser);
        }
        loadUsername();
    }, []);

    const logoutClicked = async () => {
        try {
            await logoutUser();
            await AsyncStorage.removeItem('loggedInUser');
            router.push('/(auth)/login');
        } catch (e) {
            console.error("Logout error: ", e);
        }

    }

    const settingsClicked = async () => {
        try {
            router.push('../settings');
        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    return (

        <View style={ styles.appBackground }>

            <ThemedView style={styles.headerContainer}>

                    <TouchableOpacity style = { styles.logoutButton } onPress = { logoutClicked } >
                        <Text style = { styles.headerButtonText }> LOG OUT </Text>
                    </TouchableOpacity>

                        <Image
                            source = { require('@/assets/gaintrain-images/gaintrain-banner.png')}
                            style = { styles.logo }
                        />

                    <TouchableOpacity style = { styles.headerButton } onPress = { settingsClicked } >
                        <Text style = { styles.headerButtonText }> SETTINGS </Text>
                    </TouchableOpacity>

            </ThemedView>

            <View style = { styles.spacer }/>

            <ThemedView style = { styles.card }>
                <ThemedText style = { styles.welcomeText }>Welcome, {username}</ThemedText>
            </ThemedView>

            <ThemedView style = { styles.card }>
                <ThemedText style = { styles.headingText }>Recently You...</ThemedText>
                <ThemedText style = { styles.recentText }>Logged 3 workouts.</ThemedText>
                <ThemedText style = { styles.recentText }>Made 2 new friends.</ThemedText>
                <ThemedText style = { styles.recentText }>Hit a PR of 75kg for 6 reps on {"\n"} Barbell Bench Press.</ThemedText>
            </ThemedView>

            <ThemedView style = { styles.card }>
                <ThemedText style = { styles.headingText }>Smart Suggestions</ThemedText>
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
    appBackground: {
        flex: 1,
        backgroundColor: '#E6F3FF',
    },
    logo: {
        width: 320,
        height: 100,
        resizeMode: 'contain',
    },
    headerContainer: {
        height: 140,
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 20,
        position: 'relative',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    centerTitle: {
        alignItems: 'center',
        flex: 1,
    },
    headerButton: {
        paddingVertical: 10,
        paddingHorizontal: 2,
        backgroundColor: '#D9D9D9',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        position: 'absolute',
        top: 30,
        right: 12,
        zIndex: 10,
    },
    logoutButton: {
        paddingVertical: 10,
        paddingHorizontal: 6,
        backgroundColor: '#FF4646',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        position: 'absolute',
        top: 30,
        left: 12,
        zIndex: 10,
    },
    headerButtonText: {
        fontSize: 10,
        fontWeight: 'bold',
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
        elevation: 4,
    },
    suggestionCard: {
        backgroundColor: '#C47CF8',
        padding: 10,
        margin: 6,
        borderRadius: 12,
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
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
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: '#46C3F3',
        paddingVertical: 30,
        flex: 1,
        borderRadius: 16,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
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
        height: 10,
    },
    headingText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#24C3FF',
        paddingBottom: 10,
        textAlign: 'center',
    },
    welcomeText: {
        color: '#757575',
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 25,
    },
    recentText: {
        textAlign: 'center',
        padding: 2,
    },
});
