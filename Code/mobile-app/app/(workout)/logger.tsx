import { collection, addDoc, query, where, getDocs, doc, updateDoc, Timestamp, increment } from "firebase/firestore";
import { db } from "../../src/firebase";

import { normaliseMuscleName, mapToBroadGroup, calculatePointsAwarded } from "../../src/utils/exerciseScoring";

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import DateTimePicker, { useDefaultStyles, DateType } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';

// Generates a unique key for user session draft state.
const getDraftKey = (uid: string) => `workout_draft_${uid}`;

export default function workoutLogger() {

    const [sessionDate, setSessionDate] = useState<DateType>();
    const defaultStyles = useDefaultStyles();

    const [sessionName, setSessionName] = useState("");
    const [sessionNotes, setSessionNotes] = useState("");
    const [sessionLocation, setSessionLocation] = useState("");
    const [sessionTags, setSessionTags] = useState("");

    const [showSetup, setShowSetup] = useState(true);

    const [exercises, setExercises] = useState([]);
    const [showExerciseSelector, setShowExerciseSelector] = useState(false);
    const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);

    const [exerciseLibrary, setExerciseLibrary] = useState([]);
    const [loadingExercises, setLoadingExercises] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [newExerciseName, setNewExerciseName] = useState("");
    const [newDifficulty, setNewDifficulty] = useState("");
    const [newRiskRating, setNewRiskRating] = useState("");
    const [newTags, setNewTags] = useState("");
    const [newPrimaryMuscle, setNewPrimaryMuscle] = useState("");
    const [newSecondaryMuscles, setNewSecondaryMuscles] = useState("");
    const [newBestFor, setNewBestFor] = useState<string | string[] | null>(null);

    const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
    const [showSetModal, setShowSetModal] = useState(false);
    const [newSetWeight, setNewSetWeight] = useState("");
    const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
    const [newSetReps, setNewSetReps] = useState("");
    const [newSetRPE, setNewSetRPE] = useState("");
    const [newSetEquipment, setNewSetEquipment] = useState("");
    const [newSetModifiers, setNewSetModifiers] = useState("");

    const router = useRouter();
    const [checkingLogin, setCheckingLogin] = useState(true);

    const [userUid, setUserUid] = useState<string | null>(null);
    const [userExperienceLevel, setUserExperienceLevel] = useState<string | null>(null);

    const [startedAt, setStartedAt] = useState<Date | null>(new Date());
    const [endedAt, setEndedAt] = useState<Date | null>(null);

    const [username, setUsername] = useState<string | null>(null);

    const { recommendedId } = useLocalSearchParams();
    const scrollRef = React.useRef<ScrollView>(null);
    const [justAddedRecommended, setJustAddedRecommended] = useState(false);

    const fetchExercises = async () => { // Fetch exercises from firestore
        try {
            const exercisesQuery = query(
                collection(db, "exercises")
            );

            const querySnapshot = await getDocs(exercisesQuery);

            const list = querySnapshot.docs // Only show system or user specific exercises.
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(exercise =>
                    exercise.type === "system" || (exercise.type === "user" && exercise.createdBy === userUid)
                );

            setExerciseLibrary(list);

        } catch (e) {
            console.error("Error fetching exercises: ", e);
        }
        setLoadingExercises(false);
    }

    useEffect(() => {
        if (userUid) {
            fetchExercises();
        }
    }, [userUid]);

    useEffect(() => { // Checks login and loads experience level and weight unit.
        const checkLogin = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            if (!storedUser) {
                router.replace('/(auth)/login');
                return;
            }

            setUsername(storedUser);
            const username = storedUser;

            setCheckingLogin(false);
        };
        checkLogin();

        const fetchUserPreferences = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('loggedInUser');
                if (!storedUser) return;

                const username = storedUser;

                const usersQuery = query(
                    collection(db, "users"),
                    where("username", "==", username)
                );

                const snapshot = await getDocs(usersQuery);

                if (!snapshot.empty) {
                    const userData = snapshot.docs[0].data();
                    setUserUid(userData.uid);

                    if (userData.weightUnitPreferences) {
                        setWeightUnit(userData.weightUnitPreferences);
                    }

                    if (userData.experienceLevel) {
                        setUserExperienceLevel(userData.experienceLevel);
                    }
                }
            } catch (e) {
                console.error("Error fetching user preferences:", e);
            }
        };

        fetchUserPreferences();

    }, []);

    // Refresh preferences if user goes to settings and back etc.
    useFocusEffect(
        React.useCallback(() => {
            const refreshUnitPreference = async () => {
                const storedUser = await AsyncStorage.getItem('loggedInUser');
                if (!storedUser) return;

                const usersQuery = query(
                    collection(db, "users"),
                    where("username", "==", storedUser)
                );

                const snapshot = await getDocs(usersQuery);

                if (!snapshot.empty) {
                    const userData = snapshot.docs[0].data();

                    if (userData.weightUnitPreferences) {
                        setWeightUnit(userData.weightUnitPreferences);
                    }
                }
            };

            refreshUnitPreference();
        }, [])
    );

    useEffect(() => { // Loads a saved user-specific draft session.
        const loadDraft = async () => {
            try {
                if (!userUid) return;

                const saved = await AsyncStorage.getItem(getDraftKey(userUid));

                if (!saved) return;

                const draft = JSON.parse(saved);

                setSessionName(draft.sessionName || "");
                setSessionNotes(draft.sessionNotes || "");
                setSessionLocation(draft.sessionLocation || "");
                setSessionTags(draft.sessionTags || "");
                setStartedAt(draft.startedAt ? new Date(draft.startedAt) : new Date());
                setExercises(draft.exercises || []);

            } catch (e) {
                console.error("Error loading draft:", e);
            }
        };

       loadDraft();
    }, [userUid]);

    // Match recommended exercise id with existing exercise id.
    useEffect(() => {
        if (!recommendedId) return;
        if (exerciseLibrary.length === 0) return;

        const match = exerciseLibrary.find(ex => String(ex.exerciseId) === String(recommendedId));

        if (!match) {
            console.warn("Recommended exercise not found in exercise library:", recommendedId);
            return;
        }

        // Prevent duplicates.
        setExercises(prev => {
            const exists = prev.some(e => e.id === match.id);
            if (exists) return prev;

            Alert.alert(
                "Recommended Exercise Added",
                `${match.name} was added to your session!`
            );

            setJustAddedRecommended(true);

            return [
                ...prev,
                {
                    id: match.id,
                    name: match.name,
                    primaryMuscle: match.primaryMuscle,
                    secondaryMuscles: match.secondaryMuscles || [],
                    difficulty: match.difficulty,
                    sets: []
                }
            ];
        });

        if (match) {
            router.setParams({ recommendedId: undefined });
        }

    }, [recommendedId, exerciseLibrary]);

    useEffect(() => {
        if (!justAddedRecommended) return;

        // Allow layout to finish loading.
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 150);

        setJustAddedRecommended(false);
    }, [justAddedRecommended]);

    if (checkingLogin) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const backToDashboardClicked = async () => {
        try {
            router.push('/(app)/dashboard');
        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    const settingsClicked = async () => {
        try {
            router.push('../../settings');
        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    // Always store weight in kg.
    const toKg = (value, unit) =>
        unit === "kg" ? value : value / 2.20462;

    // Convert from kgs to unit preference.
    const toDisplay = (weightKg, unit) => {
        const value = unit === "kg"
            ? weightKg
            : weightKg * 2.20462;

        return Number(value.toFixed(2));
    };

    const moveExerciseUp = (index: number) => {
        if (index === 0) return; // Already at top.
        const updated = [...exercises];
        const temp = updated[index - 1];
        updated[index - 1] = updated[index];
        updated[index] = temp;
        setExercises(updated);
    };

    const moveExerciseDown = (index: number) => {
        if (index === exercises.length - 1) return; // Already at bottom.
        const updated = [...exercises];
        const temp = updated[index + 1];
        updated[index + 1] = updated[index];
        updated[index] = temp;
        setExercises(updated);
    };

    return(

        <View style = { [styles.appBackground, { position: 'relative' }] }>

            <SafeAreaView style = { styles.headerContainer }>

                <View style = { styles.headerRow }>

                    <TouchableOpacity style = { styles.backButton } onPress = { backToDashboardClicked } >
                        <Text style = { styles.headerButtonText }> BACK </Text>
                    </TouchableOpacity>

                    <Text style = { styles.titleText }>New Workout</Text>

                    <TouchableOpacity style = { styles.headerButton } onPress = { settingsClicked } >
                        <Text style = { styles.headerButtonText }> SETTINGS </Text>
                    </TouchableOpacity>

                </View>

            </SafeAreaView>

            <View style = { styles.spacer }/>

            <KeyboardAvoidingView
                style = {{ flex: 1 }}
                behavior = { Platform.OS === 'ios' ? 'padding' : 'height' }
            >

                <ScrollView
                    ref = { scrollRef }
                    contentContainerStyle = {{ paddingBottom: 40 }}
                >

                    <View>

                        {/* Session setup card */}
                        { showSetup && (

                            <View style = { styles.card }>

                                <Text style = { styles.headingText }>Session Setup</Text>

                                <TextInput
                                    style = { styles.inputRequired }
                                    placeholder = "Session Name *"
                                    placeholderTextColor = "red"
                                    value = { sessionName }
                                    onChangeText = { setSessionName }
                                />

                                <View style = { styles.input }>
                                    <DateTimePicker
                                        mode = "single"
                                        date = { sessionDate }
                                        onChange = { ({ date }) => {
                                            setSessionDate(date);
                                            if (date) {
                                                setStartedAt(new Date(date as any));
                                            }
                                        }}
                                        timePicker = { true }
                                        use12Hours = { true }
                                        containerHeight = {220}
                                        weekdaysHeight = {20}
                                        styles = {{
                                            ...defaultStyles,
                                            selected: { ...defaultStyles.selected, backgroundColor: '#24C3FF', borderRadius: 999 },
                                            selected_label: { ...defaultStyles.selected_label, color: 'white', fontWeight: 'bold' },
                                            today: { ...defaultStyles.today, borderColor: '#24C3FF', borderWidth: 1, borderRadius: 999 },
                                        }}
                                    />

                                </View>

                                <TextInput
                                    style = { styles.input }
                                    placeholder = "Location (optional)"
                                    value = { sessionLocation }
                                    onChangeText = { setSessionLocation }
                                />

                                <TextInput
                                    style = { styles.notesInput }
                                    placeholder = "Session Notes (optional)"
                                    multiline
                                    value = { sessionNotes }
                                    onChangeText = { setSessionNotes }
                                />

                                <TextInput
                                    style = { styles.input }
                                    placeholder = "Tags (comma separated)"
                                    value = { sessionTags }
                                    onChangeText = { setSessionTags }
                                />

                            </View>

                        )}

                        <TouchableOpacity style = { styles.hideButton }
                            onPress = {() => {
                                setShowSetup(!showSetup);
                            }}>
                            <Text style = { styles.collapseText }>
                                {showSetup ? '- Hide Session Setup' : '+ Show Session Setup'}
                            </Text>
                        </TouchableOpacity>


                    </View>

                    {/* Exercise list. */}

                    <View style = { styles.card }>

                        <Text style = { styles.headingText }>Exercises</Text>

                        { exercises.length === 0 && (
                            <Text style = { styles.setText }>No exercises added yet.</Text>
                        )}

                        {/* Render each exercise and sets. */}
                        { exercises.map((exercise, index) => (

                            <View key = { index } style = { styles.exerciseCard }>

                                <View style = { styles.exerciseTitleRow }>
                                    <Text style = { styles.exerciseTitle }>{ exercise.name }</Text>
                                </View>

                                <View style = { styles.reorderColumn }>
                                    <TouchableOpacity
                                        onPress = { () => index > 0 && moveExerciseUp(index) }
                                        disabled = { index === 0 }
                                        style = {[
                                            styles.reorderButton,
                                            { opacity: index === 0 ? 0.3 : 1 }
                                        ]}
                                    >
                                        <Text style = { styles.reorderButtonText }>▲</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress = { () => index < exercises.length - 1 && moveExerciseDown(index) }
                                        disabled = { index === exercises.length - 1 }
                                        style = {[
                                            styles.reorderButton,
                                            { opacity: index === exercises.length - 1 ? 0.3 : 1 }
                                        ]}
                                    >
                                        <Text style = { styles.reorderButtonText }>▼</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* First render the sets per exercise. */}
                                { exercise.sets && exercise.sets.length > 0 && exercise.sets.map((set, setIndex) => (
                                    <View key = { setIndex } style = {{ marginTop: 4 }}>

                                        <Text style = { styles.setText }>
                                            { toDisplay(set.weight, weightUnit) }{ weightUnit } x { set.reps }
                                            { set.rpe ? ` — RPE ${set.rpe}` : "" }
                                        </Text>

                                        { set.equipment && set.equipment.length > 0 && (
                                            <Text style = { styles.setText }>
                                                Equipment: { set.equipment.join(', ') }
                                            </Text>
                                        )}

                                        { set.modifiers && set.modifiers.length > 0 && (
                                            <Text style = { styles.setText }>
                                                Modifiers: { set.modifiers.join(', ') }
                                            </Text>
                                        )}

                                        <TouchableOpacity
                                            style = {{ marginLeft: 10, marginTop: 2 }}
                                            onPress = { () => {
                                                const updatedExercises = [...exercises];
                                                updatedExercises[index].sets = updatedExercises[index].sets.filter((_, i) => i !== setIndex);
                                                setExercises(updatedExercises);
                                            }}
                                        >
                                            <Text style = {{ color: '#E25252', fontWeight: 'bold' }}>Remove Set</Text>
                                        </TouchableOpacity>

                                        { setIndex < exercise.sets.length - 1 && (
                                            <View style = {{
                                                height: 1,
                                                backgroundColor: '#D9D9D9',
                                                marginVertical: 6,
                                                marginHorizontal: 10,
                                            }} />
                                        )}

                                    </View>
                                ))}

                                <View style = { styles.buttonRow }>

                                    <TouchableOpacity
                                        style = { styles.addButton }
                                        onPress = { () => {
                                            setActiveExerciseIndex(index);
                                            setNewSetWeight("");
                                            setNewSetReps("");
                                            setNewSetRPE("");
                                            setNewSetEquipment("");
                                            setNewSetModifiers("");
                                            setShowSetModal(true)
                                        }}
                                    >
                                        <Text style = { styles.exerciseButtonText }>+ Add Set</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style = { styles.removeButton }
                                        onPress = { () => {
                                            setExercises(exercises.filter((_, i) => i !== index));
                                        }}
                                    >
                                        <Text style = { styles.exerciseButtonText }>Remove</Text>
                                    </TouchableOpacity>

                                </View>

                            </View>

                        ))}

                        <TouchableOpacity
                            style = { styles.addExerciseButton }
                            onPress = { () => setShowExerciseSelector(true) }
                        >
                            <Text style = { styles.buttonText }>+ Add Exercise</Text>
                        </TouchableOpacity>

                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

            <View style = { styles.fixedButtonRow }>

                <TouchableOpacity
                    style = { styles.saveButton }
                    onPress = { async () => {

                        if (!sessionName.trim()) {
                            Alert.alert("Missing name", "Session must have a name.");
                            return;
                        }

                        if (!startedAt) {
                            Alert.alert("Missing start time", "Session must have a start time.");
                            return;
                        }

                        if (!userUid) {
                            Alert.alert("Error", "Could not determine user ID.");
                            return;
                        }

                        if (exercises.length === 0) {
                            Alert.alert("No exercises", "You must add at least one exercise.");
                            return;
                        }

                        const now = new Date();
                        let endedAtValue = now;

                        // If user selected a future start time, match endedAt to startedAt.
                        if (startedAt && startedAt > now) {
                            endedAtValue = startedAt;
                        }

                        setEndedAt(endedAtValue);

                        const formattedSessionTags = sessionTags // Format and clean session tags.
                            .split(',')
                            .map(t => t.trim().toLowerCase().replace(/\s+/g, '_'))
                            .filter(Boolean);

                        let totalPoints = 0;
                        let musclePointsMap = {}; // i.e. { biceps: 40, quads: 20, etc }.
                        let groupPointsMap = {};

                        let uniqueExerciseIds: string[] = [];

                        async function incrementUsageCounts(ids: string[]) {    // Increment usageCount for each unique exercise.
                            for (const id of ids) {
                                const ref = doc(db, "exercises", id);

                                await updateDoc(ref, {
                                    usageCount: increment(1)
                                });
                            }
                        }

                        try { // Create session document.

                            const sessionRef = await addDoc(collection(db, "sessions"), {
                                uid: userUid,
                                startedAt: startedAt,
                                endedAt: endedAtValue,
                                location: sessionLocation.trim() || null,
                                notes: sessionNotes.trim() || null,
                                exerciseLogs: [],
                                tags: formattedSessionTags,
                                name: sessionName.trim(),
                            });

                            const exerciseLogIds = [];

                            for (const exercise of exercises) { // Create exercise logs and challenge points per exercise.

                                console.log("Processing exercise:", {
                                    name: exercise.name,
                                    primaryMuscle: exercise.primaryMuscle,
                                    secondaryMuscles: exercise.secondaryMuscles,
                                    difficulty: exercise.difficulty,
                                    sets: exercise.sets?.length || 0
                                });

                                const primary = normaliseMuscleName(exercise.primaryMuscle);
                                const secondary = Array.isArray(exercise.secondaryMuscles)
                                    ? exercise.secondaryMuscles.map(m => normaliseMuscleName(m.trim()))
                                    : typeof exercise.secondaryMuscles === "string"
                                        ? exercise.secondaryMuscles.split(',').map(m => normaliseMuscleName(m.trim()))
                                        : [];
                                const difficulty = Number(exercise.difficulty) || 3;
                                const setsCount = exercise.sets?.length || 1;

                                const points = calculatePointsAwarded(
                                    difficulty,
                                    primary,
                                    secondary,
                                    userExperienceLevel,
                                    setsCount
                                );

                                console.log("Points for exercise:", {
                                    primary,
                                    secondary,
                                    difficulty,
                                    setsCount,
                                    points
                                });

                                totalPoints += points;

                                // Track muscle totals. Primary gets full points, secondary gets half.
                                musclePointsMap[primary] = (musclePointsMap[primary] || 0) + points;

                                for (const sec of secondary) {
                                    const secondaryPoints = Math.round(points * 0.5);
                                    musclePointsMap[sec] = (musclePointsMap[sec] || 0) + secondaryPoints;
                                }

                                // Track group totals. Primary gets full points, secondary gets half.
                                const primaryGroup = mapToBroadGroup(primary);
                                groupPointsMap[primaryGroup] = (groupPointsMap[primaryGroup] || 0) + points;

                                for (const sec of secondary) {
                                    const secondaryGroup = mapToBroadGroup(sec);
                                    const secondaryPoints = Math.round(points * 0.5);
                                    groupPointsMap[secondaryGroup] = (groupPointsMap[secondaryGroup] || 0) + secondaryPoints;
                                }

                                console.log("Session totals:", {
                                    totalPoints,
                                    musclePointsMap,
                                    groupPointsMap
                                });

                                const exerciseId =
                                    exercise.id ||
                                    exercise.name.toLowerCase().replace(/\s+/g, "_");

                                const logRef = await addDoc(collection(db, "exerciseLogs"), {
                                    uid: userUid,
                                    exerciseName: exercise.name,
                                    exerciseId: exerciseId,
                                    loggedAt: endedAtValue,
                                    location: sessionLocation.trim() || null,
                                    notes: null,
                                    sets: Array.isArray(exercise.sets) ? exercise.sets : [],
                                });

                                exerciseLogIds.push(logRef.id);
                            }

                            uniqueExerciseIds = Array.from(
                                new Set(exercises.map(exercise => exercise.id || exercise.exerciseId))  // Extract unique exerciseIds from session.
                            );

                            await updateDoc(sessionRef, {
                                exerciseLogs: exerciseLogIds
                            });

                            await AsyncStorage.removeItem(getDraftKey(userUid)); // Remove draft (if session was draft).

                            if (userUid) {
                                await AsyncStorage.removeItem(`recommendations_${userUid}_`); // Remove recommendations.
                            }

                            Alert.alert("Success", "Workout saved!");
                            router.push("/(app)/dashboard")

                        } catch (e) {
                            console.error("Error saving session:", e);
                            Alert.alert("Error", "There was a problem saving your session.");
                        }

                        await incrementUsageCounts(uniqueExerciseIds);

                        // Fetch active challenges for this user.
                        if (!username) {
                            console.log("No username found, skipping challenge update");
                            return;
                        }

                        const challengesQuery = query(
                            collection(db, "challenges"),
                            where("participants", "array-contains", username),
                            where("status", "==", "active")
                        );

                        const snapshot = await getDocs(challengesQuery);

                        for (const docSnap of snapshot.docs) {

                            const challenge = docSnap.data();

                             if (challenge.status === "completed") {    // Skip challenge if already completed.
                                continue;
                             }

                            const challengeRef = doc(db, "challenges", docSnap.id);

                            let newProgress = challenge.progress || {};
                            let sharedCurrent = newProgress.shared || 0;

                            let pointsToAdd = 0;

                            switch (challenge.type) {
                                case "points":
                                    pointsToAdd = totalPoints;
                                    break;

                                case "muscle":
                                    pointsToAdd = musclePointsMap[challenge.selectedMuscle] || 0;
                                    break;

                                case "group":
                                    pointsToAdd = groupPointsMap[challenge.muscleGroup] || 0;
                                    break;

                                case "sessions":
                                    pointsToAdd = 1;
                                    break;
                            }

                            // Only update shared progress.
                            newProgress.shared = sharedCurrent + pointsToAdd;

                            // Check for challenge completion.
                            let newStatus = challenge.status;

                            if (newProgress.shared >= challenge.target) {
                                newStatus = "completed";
                            }

                            // Build updates object.
                            let updates = {
                                progress: newProgress,
                                status: newStatus,
                                lastUpdated: Timestamp.now()
                            };

                            // Notify all participants when challenge is completed.
                            if (newStatus === "completed" && !challenge.completionNotified) {

                                const participants = challenge.participants || [];

                                for (const participant of participants) {

                                    // In app alert for the user currently logging the workout.
                                    if (participant === username) {
                                        Alert.alert("Challenge Completed!", `${challenge.description}`);
                                    }

                                    // Fetch participant user data for push notifications.
                                    const usersRef = collection(db, "users");
                                    const recipientQuery = query(usersRef, where("username", "==", participant));
                                    const recipientDocs = await getDocs(recipientQuery);

                                    if (!recipientDocs.empty) {
                                        const recipient = recipientDocs.docs[0].data();

                                        if (recipient.pushToken) {
                                            try {
                                                const response = await fetch("https://exp.host/--/api/v2/push/send", {
                                                    method: "POST",
                                                    headers: {
                                                        "Accept": "application/json",
                                                        "Content-Type": "application/json"
                                                    },
                                                    body: JSON.stringify({
                                                        to: recipient.pushToken,
                                                        sound: "default",
                                                        title: "Challenge Completed!",
                                                        body: `${challenge.description}`,
                                                        data: {
                                                            challengeId: docSnap.id,
                                                            type: "challengeCompleted"
                                                        }
                                                    })
                                                });

                                                const result = await response.json();
                                                console.log("Expo push response: ", result);

                                            } catch (e) {
                                                console.log("Push notification fetch failed: ", e);
                                            }
                                        }
                                    }
                                }
                                updates.completionNotified = true;  // Mark notifications as sent.
                            }

                            await updateDoc(challengeRef, updates);
                        }

                    }}

                >
                    <Text style = { styles.buttonText }>Save Session</Text>
                </TouchableOpacity>

                { /* Saving draft. */ }

                <TouchableOpacity

                    style = { styles.laterButton }
                    onPress = { async () => {

                        try {

                            const draft = {
                                sessionName,
                                sessionNotes,
                                sessionLocation,
                                sessionTags,
                                startedAt,
                                exercises,
                            };

                            await AsyncStorage.setItem(getDraftKey(userUid), JSON.stringify(draft));

                            Alert.alert("Saved", "Your session draft has been saved.");
                            router.push("/(app)/dashboard");

                        } catch (e) {
                            console.error("Error saving draft:", e);
                            Alert.alert("Error", "Could not save your workout.");
                        }

                    }}
                >
                    <Text style = { styles.buttonText }>Finish Later</Text>
                </TouchableOpacity>

                { /* Deleting session. */ }

                <TouchableOpacity

                    style = { styles.deleteButton }
                    onPress = { () => {

                        Alert.alert(
                            "Delete Session",
                            "Are you sure you want to delete this session?",
                            [
                                { text: "Cancel" },

                                {
                                    text: "Delete",
                                    onPress: async () => {

                                        try {

                                            if (userUid) {
                                                await AsyncStorage.removeItem(getDraftKey(userUid));
                                            }

                                            setSessionName("");
                                            setSessionNotes("");
                                            setSessionLocation("");
                                            setSessionTags("");
                                            setStartedAt(new Date());
                                            setExercises([]);
                                            setShowSetup(true);

                                            Alert.alert("Deleted", "Your session has been cleared.");

                                        } catch (e) {
                                            console.error("Error deleting session:", e);
                                            Alert.alert("Error", "Could not delete your session.");
                                        }

                                    }
                                }
                            ]
                        );

                    }}

                >
                    <Text style = { styles.buttonText }>Delete Session</Text>
                </TouchableOpacity>


            </View>

            { showExerciseSelector && (
                <View style = { styles.modalOverlay }>

                    <View style = { styles.modalCard }>

                        <Text style = { styles.headingText }>Add Exercise</Text>

                        <TextInput
                            style = { styles.input }
                            placeholder = "Search exercises..."
                            value = { searchQuery }
                            onChangeText = { setSearchQuery }
                        />

                        { /* Scrollable list of search results. */ }
                        <ScrollView style = {{ maxHeight: 200 }}>

                            { exerciseLibrary
                                .filter(exercise => exercise.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((exercise, index) => (
                                    <TouchableOpacity
                                        key = { index }
                                        style = { styles.dropdownItem }
                                        onPress = { () => {
                                            // Creates a new instance of the exercise with sets.
                                            const exerciseInstance = {
                                                ... exercise,
                                                sets: []
                                            };
                                            setExercises([...exercises, exerciseInstance]);
                                            setShowExerciseSelector(false);
                                        }}
                                    >

                                        <Text style = { styles.dropdownItemText }>{ exercise.name }</Text>
                                    </TouchableOpacity>

                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style = { styles.addExerciseButton }
                            onPress = { () => {
                                setShowExerciseSelector(false);
                                setShowNewExerciseModal(true);
                            }}
                        >
                            <Text style = { styles.buttonText }>+ Create New Exercise</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style = { styles.cancelButton }
                            onPress = { () => {
                                setShowExerciseSelector(false);
                            }}
                        >
                            <Text style = { styles.buttonText }>Cancel</Text>
                        </TouchableOpacity>


                    </View>

                </View>

            )}

            { showNewExerciseModal && (
                <View style = { styles.modalOverlay }>

                    <View style = { styles.modalCard }>

                        <Text style = { styles.headingText }>New Exercise</Text>

                        <TextInput
                            style = { styles.input }
                            placeholder = "Exercise Name"
                            value = { newExerciseName }
                            onChangeText = { setNewExerciseName }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Difficulty (1-5)"
                            keyboardType = "numeric"
                            value = { newDifficulty }
                            onChangeText = { setNewDifficulty }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Risk Rating (1-5)"
                            keyboardType = "numeric"
                            value = { newRiskRating }
                            onChangeText = { setNewRiskRating }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Tags (comma separated)"
                            value = { newTags }
                            onChangeText = { setNewTags }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Primary Muscle"
                            value = { newPrimaryMuscle }
                            onChangeText = { setNewPrimaryMuscle }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Secondary Muscles (comma separated)"
                            value = { newSecondaryMuscles }
                            onChangeText = { setNewSecondaryMuscles }
                        />

                        <Text style = { styles.subtitle }>Best for:</Text>

                        <View style = { styles.bestForRow }>

                            <TouchableOpacity
                                style = { [
                                    styles.bestForButton,
                                    newBestFor === "muscle_growth" && styles.bestForSelected
                                ] }
                                onPress = { () => setNewBestFor("muscle_growth") }
                            >
                                <Text style = { styles.bestForText }>Muscle Building</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style = { [
                                    styles.bestForButton,
                                    newBestFor === "strength" && styles.bestForSelected
                                ] }
                                onPress = { () => setNewBestFor("strength") }
                            >
                                <Text style = { styles.bestForText }>Strength Gain</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style = { [
                                    styles.bestForButton,
                                    Array.isArray(newBestFor) &&
                                    newBestFor.includes("muscle_growth") &&
                                    newBestFor.includes("strength") &&
                                    styles.bestForSelected
                                ] }
                                onPress = { () => setNewBestFor(["muscle_growth", "strength"]) }
                            >
                                <Text style = { styles.bestForText }>Both</Text>
                            </TouchableOpacity>

                        </View>

                        <TouchableOpacity
                            style = { styles.saveExerciseButton }
                            onPress = { async () => {

                                // Exercise details input validation, formatting and creation.
                                // Then adds the exercise to the current session.

                                if (!newExerciseName.trim()) {
                                    Alert.alert("Missing field", "Exercise must have a name.");
                                    return;
                                }

                                if (!newDifficulty.trim()) {
                                    Alert.alert("Exercise must have a difficulty rating (1–5).");
                                    return;
                                }

                                const rawDifficulty = Number(newDifficulty);

                                if (isNaN(rawDifficulty) || rawDifficulty < 1 || rawDifficulty > 5) {
                                    Alert.alert("Difficulty must be a number between 1 and 5.");
                                    return;
                                }

                                const difficultyValue = rawDifficulty;

                                if (!newRiskRating.trim()) {
                                    Alert.alert("Exercise must have a risk rating (1–5).");
                                    return;
                                }

                                const rawRiskRating = Number(newRiskRating);

                                if (isNaN(rawRiskRating) || rawRiskRating < 1 || rawRiskRating > 5) {
                                    Alert.alert("Risk rating must be a number between 1 and 5.");
                                    return;
                                }

                                const riskRatingValue = rawRiskRating;

                                if (!newPrimaryMuscle.trim()) {
                                    Alert.alert("Exercise must have a primary muscle.");
                                    return;
                                }

                                if (newPrimaryMuscle.includes(",")) {
                                    Alert.alert("Primary muscle must be a single value, not a list.");
                                    return;
                                }

                                if (!newBestFor) {
                                    Alert.alert("Missing field", "Please select what this exercise is best for.");
                                    return;
                                }

                                // Formatting comma separated fields (tags, secondaryMuscles, bestFor)
                                // into clean arrays.
                                const formattedTags = newTags
                                    .split(',')
                                    .map(t => t.trim().toLowerCase().replace(/\s+/g, '_'));

                                const formattedSecondary = newSecondaryMuscles
                                    .split(',')
                                    .map(t => t.trim().toLowerCase().replace(/\s+/g, '_'));

                                const newExercise = {   // Makes the exercise object for firestore storage.
                                    name: newExerciseName,
                                    exerciseId: newExerciseName.toLowerCase().replace(/\s+/g, "_"),
                                    difficulty: difficultyValue,
                                    riskRating: riskRatingValue,
                                    tags: formattedTags,
                                    primaryMuscle: newPrimaryMuscle.toLowerCase().replace(/\s+/g, '_'),
                                    secondaryMuscles: formattedSecondary,
                                    bestFor: Array.isArray(newBestFor) ? newBestFor : [newBestFor],
                                    type: "user",
                                    createdBy: userUid,
                                    createdAt: new Date(),
                                };

                                try {   // Save new exercise in firestore, add it to the session and refresh library.

                                    const exerciseDoc = await addDoc(collection(db, "exercises"), newExercise);
                                    const exerciseInstance = {
                                        id: exerciseDoc.id,
                                        ... newExercise,
                                        sets: []
                                    };
                                    setExercises([...exercises, exerciseInstance]);
                                    setShowNewExerciseModal(false);
                                    await fetchExercises();

                                } catch (e) {
                                    console.error("Error saving new exercise:", e);
                                    Alert.alert("Error", "There was a problem saving this exercise.");
                                }

                            }}
                        >
                            <Text style = { styles.buttonText }>Save Exercise</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style = { styles.cancelButton }
                            onPress = { () => {
                                setShowNewExerciseModal(false);
                            }}
                        >
                            <Text style = { styles.buttonText }>Cancel</Text>
                        </TouchableOpacity>

                    </View>

                </View>
            )}

            { showSetModal && activeExerciseIndex !== null && (
                <View style = { styles.modalOverlay }>

                    <View style = { styles.modalCard }>

                        <Text style = { styles.headingText }>Add Set</Text>

                        <TextInput
                            style = { styles.input }
                            placeholder = { `Weight (${weightUnit})` }
                            keyboardType = "numeric"
                            value = { newSetWeight }
                            onChangeText = { setNewSetWeight }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Reps"
                            keyboardType = "numeric"
                            value = { newSetReps }
                            onChangeText = { setNewSetReps }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "RPE (1-10)"
                            keyboardType = "numeric"
                            value = { newSetRPE }
                            onChangeText = { setNewSetRPE }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Equipment (comma separated)"
                            value = { newSetEquipment }
                            onChangeText = { setNewSetEquipment }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Modifiers (comma separated)"
                            value = { newSetModifiers }
                            onChangeText = { setNewSetModifiers }
                        />

                        <TouchableOpacity
                            style = { styles.saveExerciseButton }
                            onPress = { () => {

                                if (    // Stop COMPLETELY empty sets.
                                    !newSetWeight.trim() &&
                                    !newSetReps.trim() &&
                                    !newSetRPE.trim() &&
                                    !newSetEquipment.trim() &&
                                    !newSetModifiers.trim()
                                ) {
                                    Alert.alert("Set cannot be completely empty.");
                                    return;
                                }

                                // Clean num inputs. (Only allows numbers 0-9 and removes any text).
                                const numericWeight = parseFloat(newSetWeight.replace(/[^0-9.]/g, ''));
                                const numericReps = parseInt(newSetReps.replace(/[^0-9.]/g, ''), 10);
                                const numericRPEraw = parseInt(newSetRPE.replace(/[^0-9]/g, ''), 10);

                                // RPE restricted from 1-10.
                                const numericRPE =
                                    isNaN(numericRPEraw)
                                        ? null
                                        : Math.max(1, Math.min(10, numericRPEraw));

                                const setObject = {     // Make the set object.
                                    weight: isNaN(numericWeight)
                                        ? 0
                                        : toKg(numericWeight, weightUnit),
                                    reps: isNaN(numericReps) ? 0 : numericReps,
                                    rpe: numericRPE,
                                    equipment: newSetEquipment
                                        ? newSetEquipment.split(',').map(e => e.trim()).filter(Boolean)
                                        : [],
                                    modifiers: newSetModifiers
                                        ? newSetModifiers.split(',').map(m => m.trim()).filter(Boolean)
                                        : [],
                                };

                                const updatedExercises = [...exercises];
                                const target = updatedExercises[activeExerciseIndex];

                                const existingSets = target.sets || [];
                                target.sets = [...existingSets, setObject];

                                setExercises(updatedExercises);
                                setShowSetModal(false);
                                setActiveExerciseIndex(null);
                            }}
                        >
                            <Text style = { styles.buttonText }>Save Set</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style = { styles.cancelButton }
                            onPress = { () => {
                                setShowSetModal(false);
                                setActiveExerciseIndex(null);
                            }}
                        >
                            <Text style = { styles.buttonText }>Cancel</Text>
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
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 6,
    },
    headerRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerButton: {
        paddingVertical: 8,
        paddingHorizontal: 2,
        backgroundColor: '#D9D9D9',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#D9D9D9',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    headerButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
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
        flex: 1,
        textAlign: 'center',
        fontSize: 34,
        fontWeight: 'bold',
        color: '#24C3FF',
        flexShrink: 1,
    },
    headingText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#24C3FF',
        paddingBottom: 10,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 6,
        marginVertical: 6,
        backgroundColor: 'white',
    },
    inputRequired: {
        borderWidth: 1.5,
        borderColor: 'black',
        borderRadius: 5,
        padding: 6,
        marginVertical: 6,
        backgroundColor: 'white',
    },
    notesInput: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        backgroundColor: 'white',
        height: 60,
    },
    exerciseCard: {
        position: 'relative',
        paddingRight: 50,
        paddingBottom: 20,
        marginVertical: 4,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 6,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    exerciseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    setText: {
        fontSize: 14,
        marginLeft: 10,
        marginBottom: 4,
    },
    addExerciseButton: {
        backgroundColor: '#58C86D',
        paddingVertical: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    saveExerciseButton: {
        backgroundColor: '#58C86D',
        paddingVertical: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#E25252',
        paddingVertical: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    addButton: {
        backgroundColor: '#58C86D',
        flex: 1,
        padding: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 4,
    },
    editButton: {
        backgroundColor: '#46C3F3',
        flex: 1,
        padding: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 4,
    },
    removeButton: {
        backgroundColor: '#E25252',
        flex: 1,
        padding: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 4,
    },
    exerciseButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: 'green',
        paddingVertical: 20,
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
    laterButton: {
        backgroundColor: '#46C3F3',
        paddingVertical: 20,
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
    deleteButton: {
        backgroundColor: '#E25252',
        paddingVertical: 20,
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
    fixedButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 500,
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        marginHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        marginTop: 4,
        overflow: 'hidden',
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
        zIndex: 100,
    },
    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
    dropdownItemText: {
        fontSize: 14,
        color: 'black',
    },
    collapseText: {
        textAlign: 'center',
        color: '#24C3FF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    hideButton: {
        backgroundColor: 'white',
        padding: 2,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 20,
        marginVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 6,
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
        zIndex: 200,
    },
    modalCard: {
        backgroundColor: 'white',
        width: '85%',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginTop: 10,
        marginBottom: 6,
        textAlign: 'center'
    },
    bestForRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    bestForButton: {
        flex: 1,
        backgroundColor: '#E6F3FF',
        paddingVertical: 10,
        marginHorizontal: 4,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        justifyContent: 'center',
    },
    bestForSelected: {
        borderWidth: 2,
        borderColor: '#24C3FF',
    },
    bestForText: {
        fontSize: 14,
        color: 'black',
        fontWeight: '500',
        textAlign: 'center',
    },
    exerciseTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    reorderColumn: {
        position: 'absolute',
        right: 5,
        top: 5,
        flexDirection: 'column',
        alignItems: 'center',
    },
    reorderButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#E6F3FF',
        borderRadius: 8,
        marginVertical: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    reorderButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#24C3FF',
    },
});