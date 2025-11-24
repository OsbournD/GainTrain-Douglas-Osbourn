import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Alert, Text, ScrollView } from 'react-native';
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
            Alert.alert('Success', result.message);

            await AsyncStorage.setItem('loggedInUser', username);

            try {
                const tokenData = await Notifications.getExpoPushTokenAsync(); // get expo push token.
                const token = tokenData.data;

                console.log("Saving push token after login: ", token);

                const usersRef = collection(db, "users");
                const usersQuery = query(usersRef, where("username", "==", username));
                const userDocs = await getDocs(usersQuery);

                if (!userDocs.empty) {
                    const userRef = doc(db, "users", userDocs.docs[0].id);

                    await updateDoc(userRef, { // save token to firestore.
                        pushToken: token
                    });
                    console.log("Stored push token for: ", username);
                } else {
                    console.log("No Firestore user found for: ", username);
                }

            } catch (e) {
                console.log("Error saving push token after login: ", e);
            }

            router.push({
                pathname: '/(tabs)/dashboard',

            });

        } else {
            Alert.alert('Error', result.message);
        }
    };

    return (
        <View style={{ flex: 1 }}>

          <ThemedView style={styles.headerContainer}>
            <ThemedText type="title">GainTrain!</ThemedText>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scrollContent}>

              <ThemedView style={styles.sectionContainer}>
                <ThemedText type = "subtitle"> Login </ThemedText>

                <TextInput style = { styles.input } placeholder = "Enter a username" value = { username } onChangeText = { setUsername } />

                <TextInput style = { styles.input } placeholder = "Enter a password" secureTextEntry value = { password } onChangeText = { setPassword } />

                <View style = { styles.buttonContainer }>
                    <Button title = 'Login' onPress = {loginClicked}/>
                </View>

                <View style = { styles.buttonContainer }>
                    <Link href = "/(tabs)">
                        <ThemedText type = "link"> Make an Account </ThemedText>
                    </Link>
                </View>

              </ThemedView>

            </ScrollView>

        </View>
      );
}

const styles = StyleSheet.create({

    headerContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#A1CEDC',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    sectionContainer: {
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        backgroundColor: 'white',

    },
    buttonContainer: {
        marginTop: 10,
    },
});