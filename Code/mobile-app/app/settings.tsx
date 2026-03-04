import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, ScrollView, Switch } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../src/firestore';
import { query, collection, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../src/firebase";

import { registerForPush } from '../app/_layout';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function settingsScreen() {

    const router = useRouter();
    const [checkingLogin, setCheckingLogin] = useState(true);

    const [user, setUser] = useState(null);

    const [showExercisePrefs, setShowExercisePrefs] = useState(false);
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>(user?.preferredMuscles || []);
    const [likedExercises, setLikedExercises] = useState<string[]>(user?.likedExercises || []);
    const [dislikedExercises, setDislikedExercises] = useState<string[]>(user?.dislikedExercises || []);

    const muscleGroupMap = {
        Chest: ["upper_chest", "mid_chest", "lower_chest"],
        Back: ["upper_back", "mid_back", "lower_back", "back"],
        Shoulders: ["side_delts", "front_delts", "rear_delts", "shoulders"],
        Arms: ["biceps", "triceps", "forearms"],
        Legs: ["quads", "hamstrings", "glutes", "calves", "adductors", "abductors"],
        Core: ["core"],
    };

    const exerciseNameToId = {
        "Bench Press": "barbell_bench_press",
        "Squat": "barbell_back_squat",
        "Deadlift": "conventional_barbell_deadlift",
        "Lat Pulldown": "cable_lat_pulldown",
        "Overhead Press": "barbell_overhead_press",
        "Barbell Row": "barbell_row",
        "Dumbbell Lateral Raise": "standing_dumbbell_lateral_raise",
        "Leg Extension": "leg_extension",
        "Leg Press": "leg_press",
        "Barbell Bicep Curl": "barbell_bicep_curl",
    };

    // Reverse maps.
    const reverseMuscleMap = {};
    Object.entries(muscleGroupMap).forEach(([group, keys]) => {
        keys.forEach(key => {
            reverseMuscleMap[key] = group;
        });
    });

    const idToExerciseName = Object.fromEntries(
        Object.entries(exerciseNameToId).map(([name, id]) => [id, name])
    );

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            if (!storedUser) return;

            const q = query(collection(db, "users"), where("username", "==", storedUser));
            const snap = await getDocs(q);

            if (!snap.empty) {
                setUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
            }
        };

        loadUser();
    }, []);

    useEffect(() => {
        if (user) {

            const dedupe = (arr) => [...new Set(arr || [])];

            // Load generalised muscle groups.
            const initialMuscles = dedupe(user.preferredMuscles || []);
            setSelectedMuscles(initialMuscles);

            // Convert exercise ids to names.
            const initialLikes = dedupe(
                (user.likedExercises || [])
                    .map(id => idToExerciseName[id])
                    .filter(Boolean)
            );

            const initialDislikes = dedupe(
                (user.dislikedExercises || [])
                    .map(id => idToExerciseName[id])
                    .filter(Boolean)
            );

            setLikedExercises(initialLikes);
            setDislikedExercises(initialDislikes);
        }
    }, [user]);

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

    const backButtonClicked = async () => {
        try {
            router.back();
        } catch (e) {
            console.error("Navigation error: ", e);
        }
    }

    const updateUser = async (fields) => {
        try {
            const ref = doc(db, "users", user.id);
            await updateDoc(ref, fields);
            setUser({ ...user, ...fields });
        } catch (e) {
            console.error("Update error:", e);
        }
    };

    return (

        <View style = { styles.appBackground }>

            <ThemedView style = { styles.headerContainer }>

                    <TouchableOpacity style = { styles.logoutButton } onPress = { logoutClicked } >
                        <Text style = { styles.headerButtonText }> LOG OUT </Text>
                    </TouchableOpacity>

                    <ThemedText style = { styles.titleText }>Settings</ThemedText>

                    <TouchableOpacity style = { styles.backButton } onPress = { backButtonClicked } >
                        <Text style = { styles.headerButtonText }> BACK </Text>
                    </TouchableOpacity>

            </ThemedView>

            <ScrollView style = {{ marginTop: 20, marginBottom: 40 }}>

                <View style = { styles.card }>

                    <ThemedText style = { styles.sectionTitle }>Account (WIP)</ThemedText>

                    <TouchableOpacity style = { styles.rowButton }>
                        <Text style = { styles.rowText }>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = { styles.rowButton }>
                        <Text style = { styles.rowText }>Change Password</Text>
                    </TouchableOpacity>

                </View>

                <View style = { styles.card }>

                    <ThemedText style = { styles.sectionTitle }>Preferences</ThemedText>

                    <View style = { styles.toggleRow }>
                        <Text style = { styles.rowText }>Measurement Units</Text>

                        <View style = { styles.unitToggleContainer }>
                            <TouchableOpacity
                                style = {[
                                    styles.unitButton,
                                    user?.weightUnitPreferences === "kg" && styles.unitButtonActive
                                ]}
                                onPress = { () => updateUser({ weightUnitPreferences: "kg" }) }
                            >
                                <Text
                                    style = {[
                                        styles.unitButtonText,
                                        user?.weightUnitPreferences === "kg" && styles.unitButtonTextActive
                                    ]}
                                >
                                    kg
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style = {[
                                    styles.unitButton,
                                    user?.weightUnitPreferences === "lbs" && styles.unitButtonActive
                                ]}
                                onPress={ () => updateUser({ weightUnitPreferences: "lbs" }) }
                            >
                                <Text
                                    style = {[
                                        styles.unitButtonText,
                                        user?.weightUnitPreferences === "lbs" && styles.unitButtonTextActive
                                    ]}
                                >
                                    lbs
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style = { styles.rowButton }
                        onPress={ () => setShowExercisePrefs(true) }
                    >
                        <Text style = { styles.rowText }>Exercise Preferences</Text>
                    </TouchableOpacity>

                </View>

                <View style = { styles.card }>

                    <View style = { styles.toggleRow }>

                        <ThemedText style = { styles.sectionTitle }>Notifications</ThemedText>
                        <Switch
                            value = { user?.notifications?.enabled ?? true }
                            onValueChange = { async (value) => {
                                await updateUser({
                                    notifications: {
                                        ...user.notifications,
                                        enabled: value
                                    }
                                });

                                if (value === true) {
                                    // Turn notifications on immediately.
                                    await registerForPush();
                                } else {
                                    // Turn notifications off immediately.
                                    const ref = doc(db, "users", user.id);
                                    await updateDoc(ref, { pushToken: null });
                                }

                            }}

                        />

                    </View>


                </View>

                <View style = { styles.card }>

                    <ThemedText style = { styles.sectionTitle }>App Info (WIP)</ThemedText>

                    <TouchableOpacity style = { styles.rowButton }>
                        <Text style = { styles.rowText }>Terms of Service</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = { styles.rowButton }>
                        <Text style = { styles.rowText }>Privacy Policy</Text>
                    </TouchableOpacity>

                </View>

                <View style = { styles.card }>

                    <ThemedText style = { [styles.sectionTitle, { color: 'red' }] }>Danger Zone</ThemedText>

                    <TouchableOpacity style = { styles.dangerButton }>
                        <Text style = { styles.dangerText }>Delete Account</Text>
                    </TouchableOpacity>

                </View>

            </ScrollView>

            { showExercisePrefs && (

                <View style = { styles.modalOverlay }>

                    <View style = { styles.modalCard }>

                        <Text style = { styles.modalTitle }>Exercise Preferences</Text>

                        <ScrollView style = {{ maxHeight: 400 }}>

                            <Text style = { styles.modalLabel }>Muscle Groups You Enjoy</Text>

                            { ["Chest","Back","Shoulders","Arms","Legs","Core"].map((muscle, index) => (

                                <TouchableOpacity
                                    key = { index }
                                    style = {[
                                        styles.optionButton,
                                        selectedMuscles.includes(muscle) && styles.optionSelected
                                    ]}
                                    onPress = { () => {
                                        if (selectedMuscles.includes(muscle)) {
                                            setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
                                        } else {
                                            setSelectedMuscles([...selectedMuscles, muscle]);
                                        }
                                    }}
                                >
                                    <Text style = { styles.optionText }>{ muscle }</Text>
                                </TouchableOpacity>

                            ))}

                            <Text style = { styles.modalLabel }>Exercise Likes / Dislikes</Text>

                            { Object.keys(exerciseNameToId).map((exercise, index) => (

                                <View key = { index } style = { styles.exerciseRow }>

                                    <Text style = { styles.exerciseText }>{ exercise }</Text>

                                    <View style = { styles.exerciseButtons }>

                                        <TouchableOpacity
                                            style = {[
                                                styles.likeButton,
                                                likedExercises.includes(exercise) && styles.likeSelected
                                            ]}
                                            onPress = { () => {

                                                if (likedExercises.includes(exercise)) {
                                                    setLikedExercises(likedExercises.filter(e => e !== exercise));
                                                } else {
                                                    setLikedExercises([...likedExercises, exercise]);
                                                    setDislikedExercises(dislikedExercises.filter(e => e !== exercise));
                                                }
                                            }}
                                        >
                                            <Text style = { styles.likeDislikeText }>Like</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style = {[
                                                styles.dislikeButton,
                                                dislikedExercises.includes(exercise) && styles.dislikeSelected
                                            ]}
                                            onPress = { () => {
                                                if (dislikedExercises.includes(exercise)) {
                                                    setDislikedExercises(dislikedExercises.filter(e => e !== exercise));
                                                } else {
                                                    setDislikedExercises([...dislikedExercises, exercise]);
                                                    setLikedExercises(likedExercises.filter(e => e !== exercise));
                                                }

                                            }}
                                        >
                                            <Text style = { styles.likeDislikeText }>Dislike</Text>
                                        </TouchableOpacity>

                                    </View>

                                </View>

                            ))}

                        </ScrollView>

                        <TouchableOpacity
                            style = { styles.modalButton }
                            onPress = { async () => {

                                // Convert generalised muscles to specific.
                                const likedBodyParts = selectedMuscles.flatMap(muscle =>
                                    muscleGroupMap[muscle] || []
                                );

                                // Convert names to ids.
                                const likedIds = likedExercises.map(name => exerciseNameToId[name]);
                                const dislikedIds = dislikedExercises.map(name => exerciseNameToId[name]);

                                // De-duplicate everything.
                                const uniqueMuscles = [...new Set(selectedMuscles)];
                                const uniqueBodyParts = [...new Set(likedBodyParts)];
                                const uniqueLikes = [...new Set(likedIds)];
                                const uniqueDislikes = [...new Set(dislikedIds)];

                                await updateUser({
                                    preferredMuscles: uniqueMuscles,
                                    likedBodyParts: uniqueBodyParts,
                                    likedExercises: uniqueLikes,
                                    dislikedExercises: uniqueDislikes
                                });

                                setShowExercisePrefs(false);
                            }}
                        >
                            <Text style = { styles.modalCloseButtonText }>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style = { styles.modalCloseButton }
                            onPress = { () => setShowExercisePrefs(false) }
                        >
                            <Text style = { styles.modalCloseButtonText }>Cancel</Text>
                        </TouchableOpacity>

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
    headerContainer: {
        height: '15%',
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
        zIndex: 20,
    },
    centerTitle: {
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#D9D9D9',
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
        right: 12,
        zIndex: 10,
    },
    headerButtonText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 20,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    spacer: {
        height: 10,
    },
    titleText: {
        fontSize: 45,
        fontWeight: 'bold',
        color: '#24C3FF',
        position: 'absolute',
        textAlign: 'center',
        lineHeight: 50,
    },
    headingText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#24C3FF',
        paddingBottom: 10,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginBottom: 10,
    },
    rowButton: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#D9D9D9',
    },
    rowText: {
        fontSize: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#D9D9D9',
    },
    placeholderSwitch: {
        width: 40,
        height: 22,
        borderRadius: 12,
        backgroundColor: '#D9D9D9',
    },
    placeholderToggle: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
    },
    dangerButton: {
        paddingVertical: 6,
        backgroundColor: '#FF4646',
        borderRadius: 8,
        marginTop: 5,
    },
    dangerText: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    unitToggleContainer: {
        flexDirection: "row",
        backgroundColor: "#D9D9D9",
        borderRadius: 10,
        overflow: "hidden",
    },
    unitButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    unitButtonActive: {
        backgroundColor: "#24C3FF",
    },
    unitButtonText: {
        fontSize: 16,
        color: "black",
        fontWeight: "bold",
    },
    unitButtonTextActive: {
        color: "white",
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 999,
    },
    modalCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 6,
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#24C3FF',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginTop: 10,
    },
    modalValue: {
        fontSize: 16,
        color: '#646262',
        marginBottom: 6,
    },
    optionButton: {
        backgroundColor: 'white',
        padding: 14,
        borderRadius: 10,
        marginVertical: 6,
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    optionSelected: {
        borderWidth: 2,
        borderColor: '#24C3FF',
    },
    optionText: {
        fontSize: 16,
        color: '#646262',
    },
    exerciseRow: {
        backgroundColor: 'white',
        padding: 14,
        borderRadius: 10,
        marginVertical: 6,
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseText: {
        fontSize: 16,
        color: '#646262',
    },
    exerciseButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    likeButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#E6F3FF',
    },
    dislikeButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FFE6E6',
    },
    likeSelected: {
        backgroundColor: '#52ABFF',
    },
    dislikeSelected: {
        backgroundColor: '#FF6B6B',
    },
    likeDislikeText: {
        fontSize: 16,
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

});
