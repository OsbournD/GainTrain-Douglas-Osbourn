// STEP 8 - Scores exercises based on user preferences.

import { ExerciseMeta, UserPreferences } from "../types";

export function scorePreferences(
    exercise: ExerciseMeta,
    prefs: UserPreferences
): number {

    let score = 0;

    // Exercise preferences.
    if (prefs.dislikedExercises?.includes(exercise.exerciseId)) {
        return -20; // Strong penalty.
    }

    if (prefs.likedExercises?.includes(exercise.exerciseId)) {
        score += 10; // Moderate bonus.
    }

    // Muscle group preferences.
    const primary = exercise.primaryMuscle;

    if (prefs.likedBodyParts?.includes(primary)) {
        score += 3; // Small bonus.
    }

    return score;
}
