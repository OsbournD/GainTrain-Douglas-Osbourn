import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Alert, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, router } from 'expo-router';

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
        // Alert.alert(result.success ? 'Success' : 'Error', result.message);

        if (result.success) {
            Alert.alert('Success', result.message);

            router.push({
                pathname: '/(tabs)/dashboard',
                params: { username },

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