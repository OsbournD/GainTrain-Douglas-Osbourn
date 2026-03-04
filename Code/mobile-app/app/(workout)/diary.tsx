import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../src/firebase";

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, ScrollView, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../src/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';

export default function workoutDiary() {

    const router = useRouter();
    const [checkingLogin, setCheckingLogin] = useState(true);

    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    const [showSessionModal, setShowSessionModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [exerciseLogs, setExerciseLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [userUid, setUserUid] = useState<string | null>(null);

    const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

    useEffect(() => {
        const fetchSessions = async () => { // Fetch logged in users sessions.
            if (!userUid) return;

            const sessionsQuery = query(
                collection(db, "sessions"),
                where("uid", "==", userUid)
            );

            const snapshot = await getDocs(sessionsQuery);

            const sessionsList = snapshot.docs  // Sort newest to oldest.
                .map(doc => ({
                    id: doc.id,
                    ... doc.data()
                }))
                .sort((a, b) => b.startedAt.toDate() - a.startedAt.toDate());

            setSessions(sessionsList);
            setLoadingSessions(false);
        }

        fetchSessions();

    }, [userUid]);

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

    useEffect(() => {
        const checkLogin = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            if (!storedUser) {
                router.replace('/(auth)/login');
                return;
            }

            const username = storedUser;

            const usersQuery = query(
                collection(db, "users"),
                where("username", "==", username)
            );

            const snapshot = await getDocs(usersQuery);

            if (!snapshot.empty) {  // Get users uid.
                const userData = snapshot.docs[0].data();
                setUserUid(userData.uid);

                if (userData.weightUnitPreferences) {
                    setWeightUnit(userData.weightUnitPreferences);
                }

            }

            setCheckingLogin(false);
        };

        checkLogin();
    }, []);

    if (loadingSessions) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

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

    const openSessionModal = async (session) => {   // Opens session modal and loads logs.

        setSelectedSession(session);
        setLoadingLogs(true);
        setShowSessionModal(true);

        if (!session.exerciseLogs || session.exerciseLogs.length === 0) {
            setExerciseLogs([]);
            setLoadingLogs(false);
            return;
        }

        try {
            const logsQuery = query(
                collection(db, "exerciseLogs"),
                where("__name__", "in", session.exerciseLogs)
            );

            const snapshot = await getDocs(logsQuery);

            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setExerciseLogs(logs);
        } catch (e) {
            console.error("Error fetching exercise logs:", e);
        }

        setLoadingLogs(false);
    };

    const deleteSession = async () => { // Deletes a session and its logs.

        if (!selectedSession) return;

        Alert.alert(
            "Delete Session",
            "Are you sure you want to delete this session?",
            [
                { text: "Cancel" },

                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {

                        try { // Deletes logs first and then the session.

                            if (selectedSession.exerciseLogs && selectedSession.exerciseLogs.length > 0) {
                                for (const logId of selectedSession.exerciseLogs) {
                                    const logRef = doc(db, "exerciseLogs", logId);
                                    await deleteDoc(logRef);
                                }
                            }

                            const sessionRef = doc(db, "sessions", selectedSession.id);
                            await deleteDoc(sessionRef);

                            setShowSessionModal(false);

                            // Removes session from ui.
                            setSessions(sessions.filter(session => session.id !== selectedSession.id));

                            Alert.alert("Deleted", "Session has been removed.");

                        } catch (e) {
                            console.error("Error deleting session:", e);
                            Alert.alert("Error", "Could not delete this session.");
                        }

                    }
                }
            ]
        );

    }

    // Convert units from kg to preferences.
    const toDisplay = (weightKg, unit) => {
        const value = unit === "kg"
            ? weightKg
            : weightKg * 2.20462;

        return Number(value.toFixed(2));
    };

    return(

            <View style={ [styles.appBackground, { position: 'relative' }] }>

                <ThemedView style = { styles.headerContainer }>

                        <TouchableOpacity style = { styles.backButton } onPress = { backToDashboardClicked } >
                            <Text style = { styles.headerButtonText }> BACK </Text>
                        </TouchableOpacity>

                        <ThemedText style = { styles.titleText }>Workout Diary</ThemedText>

                        <TouchableOpacity style = { styles.headerButton } onPress = { settingsClicked } >
                            <Text style = { styles.headerButtonText }> SETTINGS </Text>
                        </TouchableOpacity>

                </ThemedView>

                <View style = { styles.spacer }/>

                <ScrollView>

                    <View style = { styles.card }>
                        <Text style = { styles.headingText }>Monthly Summary</Text>
                        <Text style = { styles.summary }>Work in progress...</Text>
                    </View>

                    { /* Renders all sessions. */ }
                    { sessions.map(session => {

                        const started = session.startedAt.toDate();
                        const ended = session.endedAt.toDate();

                        const durationMs = ended - started;
                        const durationMin = Math.floor(durationMs / 60000);
                        const durationStr = `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`;

                        return (
                            <View key = { session.id } style = { styles.card }>

                                <Text style = { styles.sessionDate }>
                                    { started.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' - ' }
                                    { session.templateUsed ? ` - ${session.templateUsed}` : session.name }
                                </Text>

                                { session.location && (
                                    <Text style = { styles.sessionDetail }>Location: { session.location }</Text>
                                )}

                                <Text style = { styles.sessionDetail }>Notes: { session.notes ? session.notes : 'No Notes' }</Text>
                                <Text style = { styles.sessionDetail }>Duration: { durationStr }</Text>

                                { session.tags && session.tags.length > 0 && (
                                    <Text style = { styles.sessionDetail }>Tags: { session.tags.join(', ') }</Text>
                                )}

                                <TouchableOpacity
                                    style = { styles.viewButton }
                                    onPress = { () => openSessionModal(session) }
                                >
                                    <Text style = { styles.viewButtonText }>View Session</Text>
                                </TouchableOpacity>

                            </View>
                        );

                    })}

                    <Text style = { styles.endText }>You've reached the end!</Text>

                </ScrollView>

                { /* Session details modal. */ }
                { showSessionModal && selectedSession && (

                    <View style = { styles.modalOverlay }>

                        <View style = { styles.modalCard }>

                            <Text style = { styles.modalTitle }>Session Details</Text>

                            <ScrollView style = {{ maxHeight: 400 }}>

                                <Text style = { styles.modalLabel }>Name</Text>
                                <Text style = { styles.modalValue }>{ selectedSession.name }</Text>

                                <Text style = { styles.modalLabel }>Date</Text>
                                <Text style = { styles.modalValue }>
                                    { selectedSession.startedAt.toDate().toLocaleString() }
                                </Text>

                                <Text style = { styles.modalLabel }>Location</Text>
                                <Text style = { styles.modalValue }>
                                    { selectedSession.location || "None entered" }
                                </Text>

                                <Text style = { styles.modalLabel }>Notes</Text>
                                <Text style = { styles.modalValue }>
                                    { selectedSession.notes || "None entered" }
                                </Text>

                                <Text style = { styles.modalLabel }>Tags</Text>
                                <Text style = { styles.modalValue }>
                                    { selectedSession.tags && selectedSession.tags.length > 0
                                        ? selectedSession.tags.join(', ')
                                        : "None entered"
                                    }
                                </Text>

                                <Text style = { styles.modalLabel }>Template</Text>
                                <Text style = { styles.modalValue }>
                                    { selectedSession.templateUsed || "None entered" }
                                </Text>

                                <Text style = { styles.modalLabel }>Exercises</Text>

                                { loadingLogs && (
                                    <ActivityIndicator size = "small" style = {{ marginTop: 10 }} />
                                )}

                                { !loadingLogs && exerciseLogs.length === 0 && (
                                    <Text style = { styles.modalValue }>No exercises logged</Text>
                                )}

                                { /* Render exercise logs. */ }
                                { !loadingLogs && exerciseLogs.map( (log) => (

                                    <View key = { log.id } style = { styles.exerciseBlock }>

                                        <Text style = { styles.exerciseName }>{ log.exerciseName }</Text>

                                        { log.sets.map( (set, idx) => (

                                            <View key = { idx } style = {{ marginBottom: 6 }}>

                                                <Text style = { styles.setText }>
                                                    { toDisplay(set.weight, weightUnit) }{ weightUnit } x { set.reps }
                                                    { set.rpe ? ` — RPE ${ set.rpe }` : "" }
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

                                            </View>

                                        )) }

                                    </View>

                                ))}

                            </ScrollView>

                            <TouchableOpacity
                                style = { styles.deleteButton }
                                onPress = { deleteSession }
                            >
                                <Text style = { styles.closeButtonText }>Delete Session</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style = { styles.closeButton }
                                onPress = { () => setShowSessionModal(false) }
                            >
                                <Text style = { styles.closeButtonText }>Return</Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                ) }

            </View>

    );
}


const styles = StyleSheet.create({
    appBackground: {
        flex: 1,
        backgroundColor: '#E6F3FF',
    },
    headerContainer: {
        height: '14%',
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
    headerButtonText: {
        fontSize: 10,
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
        fontSize: 36,
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
    input: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 6,
        marginVertical: 10,
        backgroundColor: 'white',
    },
    summary: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginVertical: 10,
    },
    sessionDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginBottom: 4,
    },
    sessionDetail: {
        fontSize: 14,
        color: '#646262',
        marginBottom: 2,
    },
    sessionPR: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#757575',
        marginTop: 4,
    },
    viewButton: {
        backgroundColor: '#52ABFF',
        paddingVertical: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    endText: {
        color: '#757575',
        margin: 20,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 30,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#24C3FF',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginTop: 10,
    },
    modalValue: {
        fontSize: 14,
        color: '#646262',
        marginBottom: 6,
    },
    exerciseBlock: {
        backgroundColor: '#E6F3FF',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginBottom: 4,
    },
    setText: {
        fontSize: 14,
        color: '#646262',
        marginLeft: 10,
    },
    closeButton: {
        backgroundColor: '#52ABFF',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    deleteButton: {
        backgroundColor: '#E25252',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },

});