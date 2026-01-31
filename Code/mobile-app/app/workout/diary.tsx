import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../src/firebase";

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, ScrollView, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../src/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function workoutDiary() {

    const router = useRouter();
    const [checkingLogin, setCheckingLogin] = useState(true);

    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    const [userUid, setUserUid] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!userUid) return;

            const sessionsQuery = query(
                collection(db, "sessions"),
                where("uid", "==", userUid)
            );

            const snapshot = await getDocs(sessionsQuery);

            const sessionsList = snapshot.docs
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

            if (!snapshot.empty) {
                const userData = snapshot.docs[0].data();
                setUserUid(userData.uid);
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
                                    onPress = { () => console.log("view session with id: " + session.id) }
                                >
                                    <Text style = { styles.viewButtonText }>View Session</Text>
                                </TouchableOpacity>

                            </View>
                        );

                    })}

                    <Text style = { styles.endText }>You've reached the end!</Text>

                </ScrollView>

            </View>

    );
}


const styles = StyleSheet.create({
    appBackground: {
        flex: 1,
        backgroundColor: '#E6F3FF',
    },
    headerContainer: {
        height: 100,
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
        top: 30,
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

});