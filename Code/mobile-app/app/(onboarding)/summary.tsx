import React, { useEffect, useState }  from 'react';

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";

import { formatMuscleName } from "../../src/utils/muscleFormatting";
import { formatExerciseName } from "../../src/utils/exerciseFormatting";

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingSummary() {

    const router = useRouter();

    const params = useLocalSearchParams();
    const { q1, q2, q3, level, muscles, preferredMuscles, likes, dislikes, calculatedLevel, score, unit, goal, q4 } = params;

    const parsedMuscles = muscles ? JSON.parse(muscles as string) : [];
    const parsedPreferredMuscles = preferredMuscles ? JSON.parse(preferredMuscles as string) : [];
    const parsedLikes = likes ? JSON.parse(likes as string) : [];
    const parsedDislikes = dislikes ? JSON.parse(dislikes as string) : [];

    const [userUid, setUserUid] = useState<string | null>(null);
    const [authUid, setAuthUid] = useState<string | null>(null);

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

        const fetchUserUid = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('loggedInUser');
                if (!storedUser) return;

                const usersQuery = query(
                    collection(db, "users"),
                    where("username", "==", storedUser)
                );

                const snapshot = await getDocs(usersQuery);

                if (!snapshot.empty) {
                    const userDoc = snapshot.docs[0];
                    setUserUid(userDoc.id);
                    setAuthUid(userDoc.data().uid);
                }

            } catch (e) {
                console.error("Error fetching user UID:", e);
            }
        };

        checkLogin();
        fetchUserUid();

    }, []);

    const saveOnboardingData = async () => {    // Saves all onboarding data to firestore.

        if (!userUid) {
            Alert.alert("Error", "Could not determine user ID.");
            return;
        }

        try {
            await setDoc(
                doc(db, "users", userUid),
                {
                    onboardingCompleted: true,
                    experienceLevel: level,
                    goal: goal || null,
                    preferredMuscles: score !== "0" ? parsedPreferredMuscles : null,
                    likedBodyParts: score !== "0" ? parsedMuscles : null,
                    likedExercises: score !== "0" ? parsedLikes : null,
                    dislikedExercises: score !== "0" ? parsedDislikes : null,
                    weightUnitPreferences: unit,
                },
                { merge: true } // Only update onboarding fields.
            );

        } catch (e) {
            console.error("Error saving onboarding:", e);
            Alert.alert("Error", "There was a problem saving your onboarding data.")
        }
    }

    if (checkingLogin || !userUid) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (

        <View style = { styles.container }>

            <Text style = { styles.title }>Summary</Text>

            <ScrollView contentContainerStyle = {{ paddingBottom: 40 }}>

                <Text style = { styles.sectionTitle }>Your Experience Level</Text>

                <View style = { styles.card }>
                    <Text style = { styles.valueText }>{ level }</Text>
                </View>

                <Text style = { styles.sectionTitle }>Your Selected Goal</Text>

                <View style = { styles.card }>
                    <Text style = { styles.valueText }>{ q4 || "No specific goal" }</Text>
                </View>

                <Text style = { styles.sectionTitle }>Your Answers</Text>

                <View style = { styles.card }>
                    <Text style = { styles.label }>Training Duration:</Text>
                    <Text style = { styles.valueText }>{ q1 }</Text>

                    <Text style = { styles.label }>Comfort With Compounds:</Text>
                    <Text style = { styles.valueText }>{ q2 }</Text>

                    <Text style = { styles.label }>Training Experience:</Text>
                    <Text style = { styles.valueText }>{ q3 }</Text>
                </View>

                <Text style = { styles.sectionTitle }>Your Unit Preference</Text>

                <View style = { styles.card }>
                    <Text style = { styles.valueText }>{ unit }</Text>
                </View>

                { score !== "0" && (
                    <>
                        <Text style = { styles.sectionTitle }>Muscle Groups You Enjoy Training</Text>

                        <View style = { styles.card }>
                            { parsedMuscles.length > 0 ? (
                                parsedMuscles.map( (muscleGroup: string, index: number) => (
                                    <Text key = { index } style = { styles.valueText }>{ formatMuscleName(muscleGroup) }</Text>
                                ))
                            ) : (
                                <Text style = { styles.placeholder }>None selected</Text>
                            ) }
                        </View>

                        <Text style = { styles.sectionTitle }>Exercise Preferences</Text>

                        <View style = { styles.card }>

                            <Text style = { styles.label }>Liked Exercises:</Text>

                            { parsedLikes.length > 0 ? (
                                parsedLikes.map( (exercise: string, index: number) => (
                                    <Text key = { index } style = { styles.valueText }>{ formatExerciseName(exercise) }</Text>
                                ))
                            ) : (
                                <Text style = { styles.placeholder }>None selected</Text>
                            ) }

                            <Text style = { [styles.label, { marginTop: 10 }] }>Disliked Exercises:</Text>

                            { parsedDislikes.length > 0 ? (
                                parsedDislikes.map( (exercise: string, index: number) => (
                                    <Text key = { index } style = { styles.valueText }>{ formatExerciseName(exercise) }</Text>
                                ))
                            ) : (
                                <Text style = { styles.placeholder }>None selected</Text>
                            ) }

                        </View>
                    </>
                ) }

            </ScrollView>

            <TouchableOpacity
                style = { styles.finishButton }
                onPress = { async () => {

                    await saveOnboardingData();
                    await AsyncStorage.setItem('loggedInUid', authUid);
                    router.replace('/dashboard');

                }}
            >
                <Text style = { styles.finishButtonText }>Finish</Text>
            </TouchableOpacity>

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6F3FF',
        padding: 20,
    },
    title: {
        marginTop: 20,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#52ABFF',
        marginTop: 20,
        marginBottom: 10,
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#646262',
        marginTop: 6,
    },
    valueText: {
        fontSize: 16,
        color: '#333',
        marginTop: 4,
    },
    placeholder: {
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
    },
    finishButton: {
        backgroundColor: '#52ABFF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    finishButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});
