import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ExperienceLevel() {

    const router = useRouter();

    const params = useLocalSearchParams();
    const { q1, q2, q3 } = params;

    const placeholderLevel = "Intermediate";

    return (

        <View style = { styles.container }>

            <Text style = { styles.title }>Your estimated</Text>
            <Text style = { styles.title }>experience level</Text>

            <View style = { styles.card }>
                <Text style = { styles.levelText }>{ placeholderLevel }</Text>
            </View>

            <TouchableOpacity
                style = { styles.nextButton }
                onPress = { () => router.push({
                    pathname: '/preferences',
                    params: {
                        q1: q1,
                        q2: q2,
                        q3: q3,
                        level: placeholderLevel
                    }
                }) }
            >
                <Text style = { styles.nextButtonText }>Continue</Text>
            </TouchableOpacity>

        </View>

    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#E6F3FF',
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#24C3FF',
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        marginTop: 30,
        marginBottom: 30,
    },
    levelText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#52ABFF',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#646262',
        textAlign: 'center',
    },
    nextButton: {
        backgroundColor: '#52ABFF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        paddingHorizontal: 10,
    },
});

