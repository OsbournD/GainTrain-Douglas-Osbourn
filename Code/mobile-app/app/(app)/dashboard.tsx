import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../../src/firestore';

import { runRecommender } from '../../src/recommender/runRecommender';

import { Image } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function welcomeDashboard() {

    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [uid, setUid] = useState<string | null>(null);

    const [recommendations, setRecommendations] = useState(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);

    useEffect(() => {

        const loadUsername = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            const storedUid = await AsyncStorage.getItem('loggedInUid');

            setUsername(storedUser);
            setUid(storedUid);
        }
        loadUsername();
    }, []);

    useEffect(() => {
        if (!uid) return;

        const loadSuggestions = async () => {
            try {
                const result = await runRecommender(uid);
                setRecommendations(result);
            } catch (e) {
                console.error("Recommender error:", e);
            }

            setLoadingRecommendations(false);
        };

        loadSuggestions();
    }, [username]);

    const refreshSuggestions = async () => {
        if (!uid) return;

        setLoadingRecommendations(true);

        // Clear cache for this user.
        await AsyncStorage.removeItem(`recommendations_${uid}_`);

        try {
            const result = await runRecommender(uid);
            setRecommendations(result);
        } catch (e) {
            console.error("Recommender refresh error:", e);
        }

        setLoadingRecommendations(false);
    };

    const logoutClicked = async () => {
        try {
            await logoutUser();
            await AsyncStorage.removeItem('loggedInUser');
            await AsyncStorage.removeItem('loggedInUid');
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

    const startWorkoutClicked = async () => {
    try {
        router.push('/(workout)/logger');

        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    const workoutDiaryClicked = async () => {
    try {
        router.push('/(workout)/diary');

        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    return (

        <View style={ styles.appBackground }>

            <View style = { styles.topSection }>

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

            </View>

            <ScrollView>

                <View style = { styles.spacer }/>

                <ThemedView style = { styles.card }>
                    <ThemedText style = { styles.welcomeText }>Welcome, {username}</ThemedText>
                </ThemedView>

                <ThemedView style = { styles.card }>
                    <ThemedText style = { styles.headingText }>Recently You...</ThemedText>
                    <ThemedText style = { styles.recentText }>Work in progress...</ThemedText>

                </ThemedView>

                <ThemedView style = { styles.card }>
                    <View style = { styles.suggestionsHeaderRow }>
                        <ThemedText style = { styles.headingText }>Smart Suggestions</ThemedText>

                        <TouchableOpacity
                            style = { styles.refreshButton }
                            onPress = { refreshSuggestions }
                        >
                            <Text style = { styles.refreshButtonText }>REFRESH</Text>
                        </TouchableOpacity>
                    </View>

                    { loadingRecommendations && (
                        <Text style = {{ textAlign: 'center', padding: 10 }}>Loading suggestions...</Text>
                    )}

                    { !loadingRecommendations && recommendations && recommendations.primary.length === 0 && (
                        <Text style = {{ textAlign: 'center', padding: 10 }}>No suggestions available.</Text>
                    )}

                    { !loadingRecommendations && recommendations && recommendations.primary.slice(0, 2).map((ex, index) => (
                        <TouchableOpacity
                            key = { index }
                            style = { styles.suggestionCard }
                            onPress = { () => console.log("Smart suggestion clicked:", ex.exercise.exerciseId) }
                        >
                            <Text style = { styles.suggestionText }>{ ex.exercise.name }</Text>
                            <Text style = {{ color: 'white', fontSize: 12, marginTop: 4 }}>
                                { ex.explanation }
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ThemedView>

                <TouchableOpacity style = { styles.primaryButton } onPress = { () => startWorkoutClicked() } >
                    <Text style = { styles.primaryButtonText }> Start Workout </Text>
                </TouchableOpacity>
                <View style = { styles.buttonRow }>
                    <TouchableOpacity style = { styles.secondaryButton } onPress = { () => workoutDiaryClicked()} >
                        <Text style = { styles.buttonText }> Workout Diary </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style = { styles.secondaryButton } onPress = { () => console.log("Exercise discovery clicked")} >
                        <Text style = { styles.buttonText }>Exercise Discovery</Text>
                    </TouchableOpacity>
                </View>

                <View style = { styles.spacer }/>

            </ScrollView>

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
    topSection: {
        height: '20%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 20,
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
        top: 46,
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
        top: 46,
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
    refreshButton: {
        backgroundColor: '#46C3F3',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignSelf: 'flex-end',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        marginBottom: 8,
    },
    refreshButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    suggestionsHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },

});
