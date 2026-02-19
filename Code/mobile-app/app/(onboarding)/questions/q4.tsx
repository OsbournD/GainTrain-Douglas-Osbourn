import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Question4() {

    const router = useRouter();

    const params = useLocalSearchParams();
    const { q1, q2, q3, level, muscles, likes, dislikes, calculatedLevel, score, unit } = params;

    const [selected, setSelected] = useState<string | null>(null);

    const options = [
        "I want to focus on building muscle",
        "I want to focus on strength gain",
        "I want to build muscle and get stronger",
        "I don't have any specific goals",
    ];

    return (

        <View style = { styles.container }>

            <Text style = { styles.title }>What's your goal?</Text>

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
                onPress = { () => {

                    let goalValue: string | null = null;

                    switch (selected) {
                        case "I want to focus on building muscle":
                            goalValue = "muscle_gain";
                            break;

                        case "I want to focus on strength gain":
                            goalValue = "strength";
                            break;

                        case "I want to build muscle and get stronger":
                            goalValue = "general";
                            break;

                        case "I don't have any specific goals":
                            goalValue = null;
                            break;
                    }

                    router.push({
                        pathname: '../summary',
                        params: {
                            q1,
                            q2,
                            q3,
                            level,
                            muscles,
                            likes,
                            dislikes,
                            unit,
                            goal: goalValue,
                            q4: selected
                        }
                    });
                }}
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
        justifyContent: "center"
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
