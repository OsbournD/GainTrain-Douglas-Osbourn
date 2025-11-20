import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Alert, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { addUser, usernameCheck, verifyUserLogin } from '../../src/firestore';

export default function SignUpScreen() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const signUpClicked = async () => {
      if (username.trim() && password.trim()) {
          try {
              const exists = await usernameCheck(username); // check if username taken.

              if (exists) {
                  console.log("Username: " + username + " already taken");
                  Alert.alert("Username " + "'" + username + "'" + " taken!");
                  return;
              }

              const createAccountResult = await addUser(username, password); // create user account.
              if (!createAccountResult.success) {
                  Alert.alert('Error: ', createAccountResult.message);
                  return;
              }
              console.log('User ' + username + ' created an account.');

              const autoLoginResult = await verifyUserLogin(username, password);

              if (!autoLoginResult.success) {
                  Alert.alert('Login error: ', autoLoginResult.message);
                  return;
              }
              console.log('User ' + username + ' logged in after sign up.');

              Alert.alert('Welcome ' + username + '!');

              await AsyncStorage.setItem('loggedInUser', username);

              router.push({
                  pathname: '/(tabs)/dashboard',
              })

              setUsername('');
              setPassword('');

          } catch (error) {
              Alert.alert('Error, could not create account');
          }

      } else {
          Alert.alert('Error, please enter both username and password!');
      }

  };

  return (
    <View style={{ flex: 1 }}>

      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">GainTrain!</ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.sectionContainer}>

          <ThemedText type="subtitle">Sign Up</ThemedText>

          <TextInput style = { styles.input } placeholder = "Enter a username" value = { username } onChangeText = { setUsername } />

          <TextInput style = { styles.input } placeholder = "Enter a password" secureTextEntry value = { password } onChangeText = { setPassword } />

          <View style={styles.buttonContainer}>
            <Button title="Create Account" onPress={signUpClicked} />
          </View>

          <View style={styles.buttonContainer}>
            <Link href="/(tabs)/login">
              <ThemedText type="link">Already have an account? Log in</ThemedText>
            </Link>
          </View>
        </ThemedView>

        <ThemedView style={styles.sectionContainer}>
          <Link href="/(tabs)/firebaseTest">
            <ThemedText type="subtitle">Firebase Test</ThemedText>
          </Link>
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


