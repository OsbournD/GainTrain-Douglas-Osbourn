import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Alert, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, router } from 'expo-router';
import { seedTestData, addTestUser } from '../../src/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { addUser, usernameCheck, verifyUserLogin } from '../../src/firestore';

export default function SignUpScreen() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const signUpClicked = async () => {
      if (username.trim() && password.trim()) {

          if (password !== confirmPassword) {
              Alert.alert("Passwords do not match!");
              return;
          }

          try {
              const exists = await usernameCheck(username); // Check if username taken.

              if (exists) {
                  console.log("Username: " + username + " already taken");
                  Alert.alert("Username " + "'" + username + "'" + " taken!");
                  return;
              }

              const createAccountResult = await addUser(username, password); // Create user account.
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
                  pathname: '/(onboarding)',
              })

              setUsername('');
              setPassword('');
              setConfirmPassword('');

          } catch (error) {
              Alert.alert('Error, could not create account');
          }

      } else {
          Alert.alert('Error, please enter both username and password!');
      }

  };

  return (

        <View style = { styles.screen }>

            <ScrollView>

                <View style = { styles.topSection }>

                    <Image
                      source = { require('@/assets/gaintrain-images/gaintrain-icon.jpeg') }
                      style = { styles.logo }
                    />

                </View>

                <View style = { styles.card }>

                    <Text style = { styles.signupTitle }>Sign Up</Text>

                    <TextInput style = { styles.input } placeholder = "Enter a username" value = { username } onChangeText = { setUsername } />

                    <TextInput style = { styles.input } placeholder = "Enter a password" secureTextEntry value = { password } onChangeText = { setPassword } />

                    <TextInput style = { styles.input } placeholder = "Confirm password" secureTextEntry value = { confirmPassword } onChangeText = { setConfirmPassword } />

                    <TouchableOpacity style = { styles.signupButton } onPress = { signUpClicked }>
                        <Text style = { styles.signupButtonText }> CREATE ACCOUNT </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = { styles.loginLinkContainer }>
                      <Link href = "/(auth)/login">
                          <Text style = { styles.loginLink }> Already have an account? Log in </Text>
                      </Link>
                    </TouchableOpacity>

                </View>

            </ScrollView>

        </View>

  );
}

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: 'white',
    },
    topSection: {
        height: '35%',
        marginTop: 10,
        marginBottom: 40,
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
    signupTitle: {
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
    signupButton: {
        backgroundColor: '#52ABFF',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 10,
        alignItems: 'center',
    },
    signupButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginLinkContainer: {
        marginTop: 14,
        alignItems: 'center',
    },
    loginLink: {
        color: '#24C3FF',
        fontSize: 18,
    },
    buttonContainer: {
        marginTop: 10,
    },

});


