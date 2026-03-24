import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Alert, Text, ScrollView, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { verifyUserLogin } from '../../src/firestore';

import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import * as Notifications from 'expo-notifications';

export default function LoginScreen() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const loginClicked = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Error, please enter both username and password!');
            return;
        }
        const result = await verifyUserLogin(username, password);

        if (result.success) {

            await AsyncStorage.setItem('loggedInUser', username);

            let onboardingCompleted = false;

            try {
                const tokenData = await Notifications.getExpoPushTokenAsync(); // Get expo push token.
                const token = tokenData.data;

                console.log("Saving push token after login: ", token);

                const usersRef = collection(db, "users");
                const usersQuery = query(usersRef, where("username", "==", username));
                const userDocs = await getDocs(usersQuery);

                if (!userDocs.empty) {
                    const userRef = doc(db, "users", userDocs.docs[0].id);
                    const userData = userDocs.docs[0].data();
                    const prefs = userData.notifications || {};

                    if (prefs.enabled === false) {
                        console.log("Notifications disabled, not storing push token.");
                        await updateDoc(userRef, { pushToken: null });
                    } else {
                        await updateDoc(userRef, {  // Save token to firestore.
                            pushToken: token
                        });
                        console.log("Stored push token for: ", username);
                    }

                    await AsyncStorage.setItem('loggedInUid', userData.uid);

                    onboardingCompleted = userData.onboardingCompleted === true;

                } else {
                    console.log("No Firestore user found for: ", username);
                }

            } catch (e) {
                console.log("Error saving push token after login: ", e);
            }

            if (!onboardingCompleted) {
                router.push({
                    pathname: '/(onboarding)',
                });
                return;
            }

            router.push({
                pathname: '/(app)/dashboard',
            });

        } else {
            Alert.alert('Error', result.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style = {{ flex: 1 }}
            behavior = { Platform.OS === 'ios' ? 'padding' : 'height' }
        >

            <View style = { styles.screen }>

                <ScrollView>

                    <View style = { styles.topSection }>

                        <Image
                            source = { require('@/assets/gaintrain-images/gaintrain-icon.jpeg') }
                            style = { styles.logo }
                        />

                    </View>

                    <View style = { styles.card }>

                        <Text style = { styles.loginTitle }> Login </Text>

                        <TextInput
                            style = { styles.input }
                            placeholder = "Enter a username"
                            value = { username }
                            onChangeText = { setUsername }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Enter a password"
                            secureTextEntry
                            value = { password }
                            onChangeText = { setPassword }
                        />

                        <TouchableOpacity style = { styles.loginButton } onPress = { loginClicked }>
                            <Text style = { styles.loginButtonText }> LOGIN </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style = { styles.signupLinkContainer }>
                            <Link href = "/(auth)/signup">
                                <Text style = { styles.signupLink }> Make an Account </Text>
                            </Link>
                        </TouchableOpacity>

                    </View>

                </ScrollView>

            </View>

        </KeyboardAvoidingView>

    );
}

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: 'white',
    },
    topSection: {
        marginTop: 10,
        marginBottom: 40,
        height: '45%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 300,
        height: 300,
        marginTop: 30,
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 16,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#24C3FF',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 10,
        padding: 12,
        marginVertical: 10,
        backgroundColor: 'white',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#52ABFF',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 10,
        alignItems: 'center',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupLinkContainer: {
        marginTop: 14,
        alignItems: 'center',
    },
    signupLink: {
        color: '#24C3FF',
        fontSize: 18,
    },
});




