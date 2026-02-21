// STEP 6 - Scores exercises based on difficulty vs user experience level.

import { ExerciseMeta, UserPreferences } from "../types";

export function scoreDifficulty(
    exercise: ExerciseMeta,
    prefs: UserPreferences
): number {

    const difficulty = exercise.difficulty;

    // Map experience level to ideal difficulty range.
    let idealMin = 1;
    let idealMax = 3;

    if (prefs.experienceLevel === "intermediate") {
        idealMin = 2;
        idealMax = 4;
    }

    if (prefs.experienceLevel === "advanced") {
        idealMin = 3;
        idealMax = 5;
    }

    if (prefs.experienceLevel === "expert") {
        idealMin = 4;
        idealMax = 5;
    }

    // Inside ideal range.
    if (difficulty >= idealMin && difficulty <= idealMax) {
        return 20;
    }

    // Distance from nearest boundary.
    const distance = difficulty < idealMin
            ? idealMin - difficulty
            : difficulty - idealMax;

    // Slightly outside ideal range.
    if (distance === 1) {
        return 10;
    }

    // Moderately outside ideal range.
    if (distance === 2) {
        return 0;
    }

    // Far outside ideal range.
    return -10;
}
