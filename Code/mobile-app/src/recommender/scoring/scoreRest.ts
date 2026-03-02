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

        if (h < 24) {
            return -20; // Full penalty.
        }
        if (h < 48) {
            return -10; // Half penalty.
        }
    }

    // Cross-chest muscle logic (upper/mid/lower chest).
    const chestGroups = ["upper_chest", "mid_chest", "lower_chest"];

    // Backwards compatibility, old logs used "chest".
    const normalisedPrimary = primary === "chest" ? "mid_chest" : primary;

    if (chestGroups.includes(primary)) {
        for (const group of chestGroups) {
            if (group === primary) continue; // Skip exact matches.

            const last = muscleHistory.get(group);
            if (!last) continue;

            const h = hoursSince(last);

            if (h < 24) {
                penalty -= 5;      // Light penalty.
            } else if (h < 48) {
                penalty -= 2.5;    // Half penalty.
            }
        }
    }

    // Secondary muscle logic with proportional penalties.
    let secondaryTrained = 0;

    for (const sec of exercise.secondaryMuscles) {
        const secLast = muscleHistory.get(sec);
        if (!secLast) continue;

        const h = hoursSince(secLast);

        if (h < 24) {
            secondaryTrained += 1;  // Full weight.
        } else if (h < 48) {
            secondaryTrained += 0.5;    // Half weight.
        }
    }

    if (secondaryTrained > 0) {
        const secPenalty = -5 * secondaryTrained;
        penalty = Math.min(penalty, secPenalty);
    }

    return penalty;
}


