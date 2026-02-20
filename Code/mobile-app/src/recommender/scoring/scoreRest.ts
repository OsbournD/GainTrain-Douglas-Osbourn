// STEP 4 - Applies rest window penalties based on how recently a muscle was trained.

import { ExerciseMeta, UserExerciseStats } from "../types";

export function scoreRest(
    exercise: ExerciseMeta,
    muscleHistory: Map<string, Date> // Gets last time muscle was trained.
): number {

    let penalty = 0;

    // Helper to compute hours since muscle was trained.
    const hoursSince = (date: Date) => (Date.now() - date.getTime()) / (1000 * 60 * 60);

    // Primary muscle logic.
    const primary = exercise.primaryMuscle;
    const primaryLast = muscleHistory.get(primary);

    if (primaryLast) {
        const h = hoursSince(primaryLast);

        if (h < 24) return -20; // Full penalty.
        if (h < 48) return -10; // Half penalty.
    }

    // Secondary muscle logic, small penalty if trained recently.
    for (const sec of exercise.secondaryMuscles) {
        const secLast = muscleHistory.get(sec);
        if (!secLast) continue;

        const h = hoursSince(secLast);

        if (h < 24) {
            penalty = Math.min(penalty, -5); // Small penalty if less than 24hrs.
        }
    }

    return penalty;
}


