// STEP 10 - Scores exercises based on goals and bestFor.

import { ExerciseMeta, UserPreferences } from "../types";

export function scoreGoal(
    exercise: ExerciseMeta,
    prefs: UserPreferences
): number {

    const bestFor = exercise.bestFor.map(b => b.toLowerCase());

    // Treat null or "general" as BOTH muscle_gain AND strength.
    if (!prefs.goal || prefs.goal === "general") {

        let score = 0;

        if (bestFor.includes("muscle_gain")) {
            score += 15;
        }

        if (bestFor.includes("strength")) {
            score += 15;
        }

        if (score === 0) {
            score = 5;
        }

        return score;
    }

    const goal = prefs.goal.toLowerCase();

    // Strong match.
    if (bestFor.includes(goal)) {
        return 15;
    }

    // Related goals.
    if (goal === "strength" && bestFor.includes("muscle_gain")) {
        return 8;
    }

    if (goal === "muscle_gain" && bestFor.includes("strength")) {
        return 8;
    }

    // Weak mismatch.
    return -5;
}
