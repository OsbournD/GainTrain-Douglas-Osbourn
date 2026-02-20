import { ExerciseMeta, UserExerciseStats } from "../types.ts";

// STEP 3 - Scores exercise based on usageCount and how often user has performed it.

export function scoreUsage(
    exercise: ExerciseMeta,
    stats: UserExerciseStats | undefined
): number {

    const usage = exercise.usageCount || 0;

    // System exercises get a small bonus when usageCount is low.
    const systemBonus =
        exercise.type === "system" && usage < 5
            ? 5
            : 0;

    // If the user has never performed exercise, give a strong boost.
    if (!stats) {
        return 20 + usage + systemBonus;
    }

    const timesPerformed = stats.timesPerformed;

    // Penalise exercises the user performs very frequently.
    // i.e. 0 times = +20, 1 time = +15, 2 times = +10 etc
    const varietyBoost = Math.max(0, 20 - timesPerformed * 5);

    // Global popularity adds small bonus (capped at 10 to avoid popular exercise domination).
    const popularityBonus = Math.min(usage, 10);

    return varietyBoost + popularityBonus + systemBonus;
}
