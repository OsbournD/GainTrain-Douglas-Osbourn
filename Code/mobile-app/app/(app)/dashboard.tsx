import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../../src/firestore';

import { runRecommender } from '../../src/recommender/runRecommender';

import { formatMuscleName } from '../../src/utils/muscleFormatting';
import { computeUserSummary } from '../../src/utils/computeUserSummary';

import { Image } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function welcomeDashboard() {

    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [uid, setUid] = useState<string | null>(null);

    const [recommendations, setRecommendations] = useState(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [summaryModalVisible, setSummaryModalVisible] = useState(false);

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

    const openRecommendationModal = (exercise) => {
        setSelectedRecommendation(exercise);
        setModalVisible(true);
    }

    const closeRecommendationModal = () => {
        setModalVisible(false);
        setSelectedRecommendation(null);
    }

    const formatDifficulty = (value: any) => {
        const num = Number(value);
        if (!num || isNaN(num)) return "N/A";
        return `${num}/5`;
    };

    useEffect(() => {
        if (!uid) return;

        const loadSummary = async () => {
            const result = await computeUserSummary(uid);
            setSummary(result);
            setLoadingSummary(false);
        };

        loadSummary();
    }, [uid]);

    const getRandomMetric = () => {
        if (!summary) return "";

        const options = [];

        options.push(`Logged ${summary.sessionsThisWeek} workouts this week`);
        options.push(`Completed ${summary.exercisesThisMonth} exercises this month`);

        if (summary.topMuscleGroup) {
            options.push(`Focused on: ${formatMuscleName(summary.topMuscleGroup)}`);
        }

        const index = Math.floor(Math.random() * options.length);
        return options[index];
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

            <ScrollView contentContainerStyle = {{ flexGrow: 1, paddingBottom: 20 }}>

                <View style = {{ flex: 1 }}>

                    <View style = { styles.spacer }/>

                    <ThemedView style = { styles.card }>
                        <ThemedText style = { styles.welcomeText }>Welcome, {username}</ThemedText>

                        <View style = {{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>

                            <ThemedText style = { styles.headingText }>Recently You...</ThemedText>

                            <TouchableOpacity
                                onPress = { () => setSummaryModalVisible(true) }
                                style = { styles.seeMoreButton }
                            >
                                <Text style = { styles.seeMoreButtonText }>
                                    See More
                                </Text>
                            </TouchableOpacity>
                        </View>

                        { loadingSummary && (
                            <Text style = { styles.recentText }>Loading...</Text>
                        )}

                        { !loadingSummary && summary && (
                            <>
                                { summary.weeklyStreak > 0 && (
                                    <Text style = { styles.recentMetric2 }>
                                        Hit a { summary.weeklyStreak }-week streak!
                                    </Text>
                                )}

                                <Text style = { styles.recentMetric }>
                                    { getRandomMetric() }
                                </Text>

                            </>
                        )}
                    </ThemedView>

                    <ThemedView style = { styles.card }>
                        <View style = { styles.suggestionsHeaderRow }>
                            <ThemedText style = { styles.headingText }>Exercise Suggestions</ThemedText>

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
                                onPress = { () => openRecommendationModal(ex) }
                            >
                                <Text
                                    style = { styles.suggestionText }
                                    numberOfLines = { 1 }
                                    ellipsizeMode = "tail"
                                >
                                    { ex.exercise.name }
                                </Text>
                                <Text
                                    style = {{ color: 'white', fontSize: 12, marginTop: 4 }}
                                    numberOfLines = { 2 }
                                    ellipsizeMode = "tail"
                                >
                                    { ex.explanation }
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ThemedView>

                </View>

            </ScrollView>

            <View style = { styles.bottomButtonsContainer }>

                <TouchableOpacity style = { styles.primaryButton } onPress = { () => startWorkoutClicked() } >
                    <Text style = { styles.primaryButtonText }> Start Workout </Text>
                </TouchableOpacity>
                <View style = { styles.buttonRow }>
                    <TouchableOpacity style = { styles.secondaryButton } onPress = { () => workoutDiaryClicked()} >
                        <Text style = { styles.buttonText }> Workout Diary </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style = { styles.secondaryButtonWIP } onPress = { () => console.log("Exercise discovery clicked")} >
                        <Text style = { styles.buttonText }>Exercise Discovery (WIP!!)</Text>
                    </TouchableOpacity>
                </View>

            </View>

            <View style = { styles.spacer }/>

            { modalVisible && selectedRecommendation && (
                <View style = { styles.modalOverlay }>
                    <View style = { styles.modalContainer }>

                        <ScrollView contentContainerStyle = {{ paddingBottom: 20 }}>

                            <Text style = { styles.modalTitle }>{ selectedRecommendation.exercise.name }</Text>

                            <Text style = { styles.modalSubtitle }>Why was this recommended?</Text>
                            <Text style = { styles.modalText }>
                                { selectedRecommendation.explanation }
                            </Text>

                            <Text style = { styles.modalSubtitle }>Primary Muscle Targeted:</Text>
                            <Text style = { styles.modalText }>{ formatMuscleName(selectedRecommendation.exercise.primaryMuscle) }</Text>

                            { selectedRecommendation.exercise.secondaryMuscles && (
                                <>
                                    <Text style = { styles.modalSubtitle }>Secondary Muscles Targeted:</Text>
                                    <Text style = { styles.modalText }>
                                        { formatMuscleName(selectedRecommendation.exercise.secondaryMuscles.join(', ')) }
                                    </Text>
                                </>
                            )}

                            <Text style = { styles.modalSubtitle }>Difficulty:</Text>
                            <Text style = { styles.modalText }> { formatDifficulty(selectedRecommendation.exercise.difficulty) } </Text>

                            <TouchableOpacity
                                style = { styles.modalButton }
                                onPress = { () => {
                                    closeRecommendationModal();
                                    router.push({
                                        pathname: '/(workout)/logger',
                                        params: {
                                            recommendedId: selectedRecommendation.exercise.exerciseId
                                        }
                                    });
                                }}
                            >
                                <Text style = { styles.modalButtonText }>Add to New Session</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style = { styles.modalCloseButton }
                                onPress = { closeRecommendationModal }
                            >
                                <Text style = { styles.modalCloseButtonText }>Close</Text>
                            </TouchableOpacity>

                        </ScrollView>

                    </View>
                </View>
            )}

            { summaryModalVisible && summary && (
                <View style = { styles.modalOverlay }>
                    <View style = { styles.modalContainer }>

                        <ScrollView contentContainerStyle = {{ paddingBottom: 20 }}>

                            <Text style = { styles.modalTitle2 }>Recently You...</Text>

                            <Text style = { styles.modalSubtitle }>Sessions this week:</Text>
                            <Text style = { styles.modalText }>{ summary.sessionsThisWeek }</Text>

                            <Text style = { styles.modalSubtitle }>Exercises logged this month:</Text>
                            <Text style = { styles.modalText }>{ summary.exercisesThisMonth }</Text>

                            <Text style = { styles.modalSubtitle }>Top muscle this month:</Text>
                            <Text style = { styles.modalText }>
                                { summary.topMuscleGroup ? formatMuscleName(summary.topMuscleGroup) : "N/A" }
                            </Text>

                            <Text style = { styles.modalSubtitle }>Weekly streak:</Text>
                            <Text style = { styles.modalText }>{ summary.weeklyStreak } weeks</Text>

                            <TouchableOpacity
                                style = { styles.modalCloseButton }
                                onPress = { () => setSummaryModalVisible(false) }
                            >
                                <Text style = { styles.modalCloseButtonText }>Close</Text>
                            </TouchableOpacity>

                        </ScrollView>

                    </View>
                </View>
            )}

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
        justifyContent: 'center',
        height: 75,
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
        paddingVertical: 24,
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
        paddingVertical: 24,
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
    secondaryButtonWIP: {
        backgroundColor: '#757575',
        paddingVertical: 24,
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
        marginBottom: 10,
    },
    recentText: {
        textAlign: 'center',
        fontSize: 16,
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
    bottomButtonsContainer: {
        paddingBottom: 10,
        backgroundColor: '#E6F3FF',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#C47CF8',
    },
    modalSubtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    modalText: {
        fontSize: 16,
        marginTop: 4,
    },
    modalButton: {
        backgroundColor: 'green',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 20,
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        backgroundColor: '#FF4646',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 10,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    seeMoreButton: {
        backgroundColor: '#46C3F3',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignSelf: 'flex-end',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        marginBottom: 8,
    },
    seeMoreButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalTitle2: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#46C3F3',
    },
    recentMetric: {
        textAlign: 'left',
        fontSize: 16,
        paddingVertical: 2,
    },
    recentMetric2: {
        textAlign: 'left',
        fontWeight: 'bold',
        fontSize: 16,
        paddingVertical: 2,
    },
});
