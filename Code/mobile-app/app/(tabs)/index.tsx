import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Alert } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

import { addUser, usernameCheck } from '../../src/firestore';

export default function SignUpScreen() {
  // console.log("HomeScreen loading!");

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
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">GainTrain!</ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type = "subtitle"> Sign Up </ThemedText>

        <TextInput style = { styles.input } placeholder = "Enter a username" value = { username } onChangeText = { setUsername } />

        <TextInput style = { styles.input } placeholder = "Enter a password" secureTextEntry value = { password } onChangeText = { setPassword } />

        <View style = { styles.buttonContainer }>
            <Button title = 'Create Account' onPress = {signUpClicked} />
        </View>

        <View style = { styles.buttonContainer }>
            <Link href = "/(tabs)/login">
                <ThemedText type = "link"> Already have an account? Log in </ThemedText>
            </Link>
        </View>

      </ThemedView>



      <ThemedView style={styles.sectionContainer}>

        <Link href = "/(tabs)/firebaseTest">
            <ThemedText type = "subtitle"> Firebase Test </ThemedText>
        </Link>



      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },

  input: {
      borderWidth: 1,
      borderColour: 'black',
      borderRadius: 5,
      padding: 10,
      backgroundColor: 'white',
      },

  buttonContainer: {
      marginTop: 10,
      },

});
