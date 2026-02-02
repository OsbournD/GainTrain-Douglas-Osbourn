import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingWelcome() {

    const router = useRouter();

    return (

        <View style = { styles.container }>

            <Text style = { styles.title }>Welcome to GainTrain!</Text>

            <Text style = { styles.subtitle }>
                Let's get to know your training background.
            </Text>

            <TouchableOpacity
                style = { styles.startButton }
                onPress = { () => router.push('/questions/q1') }
            >
                <Text style = { styles.startButtonText }>Start</Text>
            </TouchableOpacity>

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E6F3FF',
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#646262',
        textAlign: 'center',
        marginBottom: 40,
    },
    startButton: {
        backgroundColor: '#52ABFF',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});
