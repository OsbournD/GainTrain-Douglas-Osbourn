import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ExercisePreferences() {

    const router = useRouter();

    const params = useLocalSearchParams();
    const { q1, q2, q3, level, score } = params;

    const muscleGroups = [
        "Chest",
        "Back",
        "Shoulders",
        "Arms",
        "Legs",
        "Core",
    ];

    const exercises = [
        "Bench Press",
        "Squat",
        "Deadlift",
        "Lat Pulldown",
        "Overhead Press",
        "Barbell Row",
        "Dumbbell Lateral Raise",
        "Leg Extension",
        "Leg Press",
        "Barbell Curl",
    ];

    const [weightUnit, setWeightUnit] = useState<"kg" | "lbs" | null>(null);
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [likedExercises, setLikedExercises] = useState<string[]>([]);
    const [dislikedExercises, setDislikedExercises] = useState<string[]>([]);

    const showPreferences = score !== "0"; // Dont show preferences section if user scored 0.

    // Toggle muscle group and like/dislike selection.
    // removes other selected button if toggle.
    const toggleMuscle = (muscle: string) => {
        if (selectedMuscles.includes(muscle)) {
            setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
        } else {
            setSelectedMuscles([...selectedMuscles, muscle]);
        }
    };

    const toggleLike = (exercise: string) => {
        if (likedExercises.includes(exercise)) {
            setLikedExercises(likedExercises.filter(e => e !== exercise));
        } else {
            setLikedExercises([...likedExercises, exercise]);
            setDislikedExercises(dislikedExercises.filter(e => e !== exercise));
        }
    };

    const toggleDislike = (exercise: string) => {
        if (dislikedExercises.includes(exercise)) {
            setDislikedExercises(dislikedExercises.filter(e => e !== exercise));
        } else {
            setDislikedExercises([...dislikedExercises, exercise]);
            setLikedExercises(likedExercises.filter(e => e !== exercise));
        }
    };

    const handleContinue = () => {  // Validates preferences before continuing.

        const noMuscles = selectedMuscles.length === 0;
        const noLikes = likedExercises.length === 0;
        const noDislikes = dislikedExercises.length === 0;

        const noPreferences = noMuscles && noLikes && noDislikes;

        if (!weightUnit) {
            Alert.alert("Select Weight Unit", "Please choose kg or lbs before continuing.");
            return;
        }

        if (showPreferences && noPreferences) {
            Alert.alert(
                "No Preferences Selected",
                "Selecting preferences helps tailor your training recommendations. Are you sure you want to continue?",
                [
                    { text: "Go Back", style: "cancel" },
                    {
                        text: "Continue Anyway",
                        style: "destructive",
                        onPress: () => proceedToGoals()
                    }
                ]
            );
        } else {
            proceedToGoals();
        }
    };

    const proceedToGoals = () => {
        router.push({
            pathname: '/questions/q4',
            params: {
                q1,
                q2,
                q3,
                level,
                muscles: JSON.stringify(selectedMuscles),
                likes: JSON.stringify(likedExercises),
                dislikes: JSON.stringify(dislikedExercises),
                unit: weightUnit
            }
        });
    };

    return (

        <View style = { styles.container }>

            <Text style = { styles.title }>Your Training Preferences</Text>

            <ScrollView contentContainerStyle = {{ paddingBottom: 40 }}>

                <Text style = { styles.sectionTitle }>Weight Unit Preference</Text>

                <Text style = { styles.subtitle }>Can change later in settings!</Text>

                <View style = { styles.card }>
                    <View style = { styles.unitButtons }>

                        <TouchableOpacity
                            style = {[
                                styles.unitButton,
                                weightUnit === "kg" && styles.likeSelected
                            ]}
                            onPress = { () => setWeightUnit("kg") }
                        >
                            <Text style = { styles.unitText }>kg</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style = {[
                                styles.unitButton,
                                weightUnit === "lbs" && styles.likeSelected
                            ]}
                            onPress = {() => setWeightUnit("lbs") }
                        >
                            <Text style = { styles.unitText }>lbs</Text>
                        </TouchableOpacity>

                    </View>

                </View>

                { /* Only show if user has training experience (not score 0). */}
                { showPreferences && (
                    <>

                        <Text style = { styles.sectionTitle }>Muscle Groups You Enjoy Training</Text>

                        <Text style = { styles.subtitle }>Can choose multiple!</Text>

                        { muscleGroups.map( (muscle, index) => (

                            <TouchableOpacity
                                key = { index }
                                style = { [
                                    styles.optionButton,
                                    selectedMuscles.includes(muscle) && styles.optionSelected
                                ] }
                                onPress = { () => toggleMuscle(muscle) }
                            >
                                <Text style = { styles.optionText }>{ muscle }</Text>
                            </TouchableOpacity>

                        )) }

                        <Text style = { styles.sectionTitle }>Exercise Preferences</Text>

                        <Text style = { styles.subtitle }>Helps get a better idea of what you like</Text>

                        { exercises.map( (exercise, index) => (

                            <View key = { index } style = { styles.exerciseRow }>

                                <Text style = { styles.exerciseText }>{ exercise }</Text>

                                <View style = { styles.exerciseButtons }>

                                    <TouchableOpacity
                                        style = { [
                                            styles.likeButton,
                                            likedExercises.includes(exercise) && styles.likeSelected
                                        ] }
                                        onPress = { () => toggleLike(exercise) }
                                    >
                                        <Text style = { styles.likeDislikeText }>Like</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style = { [
                                            styles.dislikeButton,
                                            dislikedExercises.includes(exercise) && styles.dislikeSelected
                                        ] }
                                        onPress = { () => toggleDislike(exercise) }
                                    >
                                        <Text style = { styles.likeDislikeText }>Dislike</Text>
                                    </TouchableOpacity>

                                </View>

                            </View>

                        )) }
                    </>
                )}

            </ScrollView>

            <TouchableOpacity
                style = { styles.nextButton }
                onPress = { handleContinue }
            >
                <Text style = { styles.nextButtonText }>Continue</Text>
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
        marginBottom: 16,
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#52ABFF',
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#646262',
        marginBottom: 20,
    },
    exerciseRow: {
        backgroundColor: 'white',
        padding: 14,
        borderRadius: 10,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseText: {
        fontSize: 16,
        color: '#646262',
    },
    exerciseButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    likeButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#E6F3FF',
    },
    dislikeButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FFE6E6',
    },
    likeSelected: {
        backgroundColor: '#52ABFF',
    },
    dislikeSelected: {
        backgroundColor: '#FF6B6B',
    },
    likeDislikeText: {
        fontSize: 16,
    },
    nextButton: {
        backgroundColor: '#52ABFF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    card: {
        backgroundColor: 'white',
        padding: 14,
        borderRadius: 10,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    unitButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    unitButton: {
        padding: 10,
        flex: 1,
        borderRadius: 8,
        backgroundColor: '#E6F3FF',
    },
    unitText: {
        fontSize: 18,
        textAlign: "center",
    },
});
