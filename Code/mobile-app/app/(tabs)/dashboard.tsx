import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { logoutUser } from '../../src/firestore';

export default function welcomeDashboard() {

    const { username } = useLocalSearchParams();
    const router = useRouter();

    const logoutClicked = async () => {
        try {
            await logoutUser();
            router.push('/(tabs)/login');
        } catch (e) {
            console.error("Logout error: ", e);
        }

    }

    return (

        <View style={{ flex: 1 }}>

            <ThemedView style={styles.headerContainer}>
                <ThemedText type="title">GainTrain!</ThemedText>
            </ThemedView>

            <ThemedView style = { styles.container }>

                <ThemedText type = "title"> Welcome, {username}!</ThemedText>
                <ThemedText type = "default"> You've successfully logged in to GainTrain! </ThemedText>

                <View style = { styles.buttonContainer }>
                    <Button title = "Log Out" onPress = { logoutClicked }/>
                </View>

            </ThemedView>

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
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    buttonContainer: {
        marginTop: 20,
    },
});
