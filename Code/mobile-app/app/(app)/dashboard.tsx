import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../../src/firestore';
import { useIsFocused } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function welcomeDashboard() {

    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const isFocused = useIsFocused();

    useEffect(() => { // when screen is focused, check for login and load logged in username.

        const checkLogin = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');

            if (!storedUser) {
                router.replace('/(auth)/login');
                return;
            }

            setUsername(storedUser);
            setLoadingUser(false);
        }

        if (isFocused) {
            checkLogin();
        }
    }, [isFocused]);

    if (loadingUser) { // load spinner if checking login.
        return (
            <View style = {{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size = "large" />
            </View>
        )
    }

    const logoutClicked = async () => {
        try {
            await logoutUser();
            await AsyncStorage.removeItem('loggedInUser');
            router.push('/(auth)/login');
        } catch (e) {
            console.error("Logout error: ", e);
        }

    }

    return (

        <View style={{ flex: 1 }}>

            <ThemedView style={styles.headerContainer}>
                <View style = { styles.headerRow }>
                    <View style = { styles.leftButton }>
                        <Button title = "Log Out" onPress = { logoutClicked }/>
                    </View>
                    <View style = { styles.centerTitle } >
                        <ThemedText type="title">GainTrain!</ThemedText>
                    </View>
                    <View style = { styles.rightButton }>
                        <Button title = "Settings" onPress = { () => console.log("Settings button clicked") }/>
                    </View>
                </View>
            </ThemedView>

            <ThemedView style = { styles.card }>

                <ThemedText type = "title"> Welcome, {username}</ThemedText>
                <ThemedText type = "default"> You've successfully logged in to GainTrain! </ThemedText>



            </ThemedView>

        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        height: 120,
        justifyContent: 'center',
        backgroundColor: '#94C8FF',
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    leftButton: {
        flex: 1,
    },
    centerTitle: {
        flex: 2,
        alignItems: 'center',
    },
    rightButton: {
        flex: 1,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
});
