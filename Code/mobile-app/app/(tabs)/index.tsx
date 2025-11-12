import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Alert, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

import { addUser, usernameCheck } from '../../src/firestore';

export default function SignUpScreen() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const signUpClicked = async () => {
      if (username.trim() && password.trim()) {
          try {
              const exists = await usernameCheck(username);

              if (exists) {
                  console.log("Username: " + username + " already taken");
                  Alert.alert("Username " + "'" + username + "'" + " taken!");
                  return;
              }

              await addUser(username, password);
              console.log('User ' + username + ' created an account.');
              Alert.alert('Welcome ' + username + '!');

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


