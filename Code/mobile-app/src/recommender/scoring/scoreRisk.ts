// STEP 7 - Scores exercises based on risk rating vs user experience level.

import { ExerciseMeta, UserPreferences } from "../types";

export function scoreRisk(
    exercise: ExerciseMeta,
    prefs: UserPreferences
): number {

    const risk = exercise.riskRating;

    // Beginner logic.
    if (prefs.experienceLevel === "beginner") {
        if (risk >= 4) return -20; // Strong penalty.
        if (risk >= 3) return -10; // Moderate penalty.
        if (risk >= 2) return -5;  // Small penalty.
        return -2; // Very small penalty.
    }

    // Intermediate logic.
    if (prefs.experienceLevel === "intermediate") {
        if (risk >= 4) return -10; // Moderate penalty.
        if (risk >= 2) return -5;  // Small penalty.
        return 0;
    }

    // Advanced logic.
    if (prefs.experienceLevel === "advanced") {
        if (risk >= 4) return -5;  // Small penalty.
        return 0;
    }

    // Expert logic.
    if (prefs.experienceLevel === "expert") {
        if (risk >= 4) return -2;  // Very small penalty.
        return 0;
    }

    return 0;
}
