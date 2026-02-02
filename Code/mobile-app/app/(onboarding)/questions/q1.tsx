import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Question1() {

    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);

    const options = [
        "Never",
        "< 6 months",
        "6–18 months",
        "1.5–3 years",
        "3+ years",
    ];

    return (

        <View style = { styles.container }>

            <Text style = { styles.title }>How long have you been weight training?</Text>

            { options.map( (option, index) => (

                <TouchableOpacity
                    key = { index }
                    style = { [
                        styles.optionButton,
                        selected === option && styles.optionSelected
                    ] }
                    onPress = { () => setSelected(option) }
                >
                    <Text style = { styles.optionText }>{ option }</Text>
                </TouchableOpacity>

            )) }

            <TouchableOpacity
                style = { [
                    styles.nextButton,
                    !selected && { opacity: 0.4 }
                ] }
                disabled = { !selected }
                onPress = { () => router.push({
                    pathname: 'questions/q2',
                    params: { q1: selected }
                })}
            >
                <Text style = { styles.nextButtonText }>Next</Text>
            </TouchableOpacity>

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6F3FF',
        padding: 20,
        justifyContent: 'center'
    },
    title: {
        marginTop: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginBottom: 20,
        textAlign: 'center',
    },
    optionButton: {
        backgroundColor: 'white',
        padding: 14,
        borderRadius: 10,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    optionSelected: {
        borderWidth: 2,
        borderColor: '#24C3FF',
    },
    optionText: {
        fontSize: 16,
        color: '#646262',
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
    },
});
