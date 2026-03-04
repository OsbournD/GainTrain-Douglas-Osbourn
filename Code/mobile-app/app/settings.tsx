import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../src/firestore';
import { query, collection, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../src/firebase";

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function settingsScreen() {

    const router = useRouter();
    const [checkingLogin, setCheckingLogin] = useState(true);

    const [user, setUser] = useState(null);

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

                    <ThemedText style={ styles.sectionTitle }>Account</ThemedText>

                    <TouchableOpacity style = { styles.rowButton }>
                        <Text style={styles.rowText}>Edit Profile</Text>
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

                </View>

                <View style = { styles.card }>

                    <ThemedText style = { styles.sectionTitle }>Notifications</ThemedText>

                    <View style = { styles.toggleRow }>

                        <Text style = { styles.rowText }>Workout Reminders</Text>
                        <View style = { styles.placeholderSwitch } />

                    </View>

                    <View style = { styles.toggleRow }>

                        <Text style = { styles.rowText }>Friend Activity</Text>
                        <View style = { styles.placeholderSwitch } />

                    </View>

                </View>

                <View style = { styles.card }>

                    <ThemedText style = { styles.sectionTitle }>App Info</ThemedText>

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

});
