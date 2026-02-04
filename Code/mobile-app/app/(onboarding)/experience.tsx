import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const questionScoring = (q1: string, q2: string, q3: string) => {

    let score = 0;

    if (q1 === "Never") score += 0;
    else if (q1 === "< 6 months") score += 1;
    else if (q1 === "< 6-18 months") score += 2;
    else if (q1 === "1.5-3 years") score += 3;
    else if (q1 === "3+ years") score += 4;

    if (q2 === "Not at all / I don’t know what those are") score += 0;
    else if (q2 === "Somewhat") score += 1;
    else if (q2 === "Comfortable") score += 2;
    else if (q2 === "Very comfortable / I could do them in my sleep") score += 3;

    if (q3 === "I don’t weight train") score += 0;
    else if (q3 === "Machines only") score += 1;
    else if (q3 === "Machines + free-weights") score += 2;
    else if (q3 === "Free weights only (dumbbells, barbells, kettlebells)") score += 3;
    else if (q3 === "Barbell focused training (powerlifting style)") score += 4;

    return score;
}

const mapScoreToLevel = (score: number) => {
    if (score <= 3) return "Beginner";
    if (score <= 6) return "Intermediate";
    if (score <= 9) return "Advanced";
    return "Expert";
}

export default function ExperienceLevel() {

    const router = useRouter();

    const params = useLocalSearchParams();
    const { q1, q2, q3 } = params;

    const score = questionScoring(q1 as string, q2 as string, q3 as string);
    const calculatedLevel = mapScoreToLevel(score);

    const [overrideLevel, setOverrideLevel] = React.useState<string | null>(null);
    const finalLevel = overrideLevel ?? calculatedLevel;

    return (

        <View style = { styles.container }>

            <Text style = { styles.title }>Your estimated</Text>
            <Text style = { styles.title }>experience level</Text>

            <View style = { styles.card }>
                <Text style = { styles.levelText }>{ finalLevel }</Text>

                <Text style = { styles.description }>
                    Adjust if this doesn’t feel accurate.
                </Text>

                <View style = {{ marginTop: 20 }}>
                    { ["Beginner", "Intermediate", "Advanced", "Expert"].map( (level) => (
                        <TouchableOpacity
                            key = { level }
                            style = { [
                                styles.levelOption,
                                finalLevel === level && styles.levelOptionSelected
                            ] }
                            onPress = { () => setOverrideLevel(level) }
                        >
                            <Text
                                style = { [
                                    styles.levelOptionText,
                                    finalLevel === level && styles.levelOptionTextSelected
                                ] }
                            >
                                { level }
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                style = { styles.nextButton }
                onPress = { () => {

                    const navigate = () => {
                        if (score === 0) {
                            router.push({
                                pathname: '/summary',
                                params: {
                                    q1: q1,
                                    q2: q2,
                                    q3: q3,
                                    level: finalLevel,
                                    score: score.toString(),
                                }
                            });
                        } else {
                            router.push({
                                pathname: '/preferences',
                                params: {
                                    q1: q1,
                                    q2: q2,
                                    q3: q3,
                                    level: finalLevel,
                                    score: score.toString(),
                                }
                            });
                        }
                    }

                    if (overrideLevel && overrideLevel !== calculatedLevel) {
                        Alert.alert(
                            "Confirm change",
                            "Adjusting your recommended experience level may result in a training experience that doesn’t feel accurate.",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Continue", style: "destructive", onPress: navigate }
                            ]
                        );
                    } else {
                        navigate();
                    }

                }}
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
    levelOption: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 10,
    },
    levelOptionSelected: {
        backgroundColor: "#52ABFF",
        borderColor: "#52ABFF",
    },
    levelOptionText: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
    },
    levelOptionTextSelected: {
        color: "white",
        fontWeight: "bold",
    },
});

