import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OnboardingSummary() {

    const router = useRouter();

    const params = useLocalSearchParams();
    const { q1, q2, q3, level, muscles, likes, dislikes, calculatedLevel, score } = params;

    const parsedMuscles = muscles ? JSON.parse(muscles as string) : [];
    const parsedLikes = likes ? JSON.parse(likes as string) : [];
    const parsedDislikes = dislikes ? JSON.parse(dislikes as string) : [];

    return (

        <View style = { styles.container }>

            <Text style = { styles.title }>Summary</Text>

            <ScrollView contentContainerStyle = {{ paddingBottom: 40 }}>

                <Text style = { styles.sectionTitle }>Your Experience Level</Text>

                <View style = { styles.card }>
                    <Text style = { styles.valueText }>{ level }</Text>
                </View>

                <Text style = { styles.sectionTitle }>Your Answers</Text>

                <View style = { styles.card }>
                    <Text style = { styles.label }>Training Duration:</Text>
                    <Text style = { styles.valueText }>{ q1 }</Text>

                    <Text style = { styles.label }>Comfort with Compounds:</Text>
                    <Text style = { styles.valueText }>{ q2 }</Text>

                    <Text style = { styles.label }>Training Style:</Text>
                    <Text style = { styles.valueText }>{ q3 }</Text>
                </View>

                { score !== "0" && (
                    <>
                        <Text style = { styles.sectionTitle }>Muscle Groups You Enjoy Training</Text>

                        <View style = { styles.card }>
                            { parsedMuscles.length > 0 ? (
                                parsedMuscles.map( (muscleGroup: string, index: number) => (
                                    <Text key = { index } style = { styles.valueText }>{ muscleGroup }</Text>
                                ))
                            ) : (
                                <Text style = { styles.placeholder }>None selected</Text>
                            ) }
                        </View>

                        <Text style = { styles.sectionTitle }>Exercise Preferences</Text>

                        <View style = { styles.card }>

                            <Text style = { styles.label }>Liked Exercises:</Text>

                            { parsedLikes.length > 0 ? (
                                parsedLikes.map( (exercise: string, index: number) => (
                                    <Text key = { index } style = { styles.valueText }>{ exercise }</Text>
                                ))
                            ) : (
                                <Text style = { styles.placeholder }>None selected</Text>
                            ) }

                            <Text style = { [styles.label, { marginTop: 10 }] }>Disliked Exercises:</Text>

                            { parsedDislikes.length > 0 ? (
                                parsedDislikes.map( (exercise: string, index: number) => (
                                    <Text key = { index } style = { styles.valueText }>{ exercise }</Text>
                                ))
                            ) : (
                                <Text style = { styles.placeholder }>None selected</Text>
                            ) }

                        </View>
                    </>
                ) }

            </ScrollView>

            <TouchableOpacity
                style = { styles.finishButton }
                onPress = { () => router.replace('/dashboard') }
            >
                <Text style = { styles.finishButtonText }>Finish</Text>
            </TouchableOpacity>

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6F3FF',
        padding: 20,
    },
    title: {
        marginTop: 20,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#52ABFF',
        marginTop: 20,
        marginBottom: 10,
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#646262',
        marginTop: 6,
    },
    valueText: {
        fontSize: 16,
        color: '#333',
        marginTop: 4,
    },
    placeholder: {
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
    },
    finishButton: {
        backgroundColor: '#52ABFF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    finishButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});
