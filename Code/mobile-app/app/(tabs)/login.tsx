import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Alert } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

import { verifyUserLogin } from '../../src/firestore';

export default function LoginScreen() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const loginClicked = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Error, please enter both username and password!');
            return;
        }
        const result = await verifyUserLogin(username, password);
        Alert.alert(result.success ? 'Success' : 'Error', result.message);
    };

    return (
        <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>

          <ThemedView style={styles.headerContainer}>
            <ThemedText type="title">GainTrain!</ThemedText>
          </ThemedView>

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