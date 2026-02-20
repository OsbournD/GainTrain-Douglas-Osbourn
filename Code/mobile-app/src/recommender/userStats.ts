import { ExerciseLog, UserExerciseStats } from "./types.ts";

// STEP 1 - Computes user-specific exercise stats from their exercise logs.

export function computeUserExerciseStats(logs: ExerciseLog[]): Map<string, UserExerciseStats> {

    const statsMap = new Map<string, UserExerciseStats>();

    for (const log of logs) {

        const existing = statsMap.get(log.exerciseId);

        // Determine the most recent performance date.
        const lastPerformedAt =
            existing?.lastPerformedAt
                ? (log.loggedAt > existing.lastPerformedAt ? log.loggedAt : existing.lastPerformedAt)
                : log.loggedAt;

        // Count how many times the user has performed this exercise.
        const timesPerformed = (existing?.timesPerformed || 0) + 1;

        // Estimate recent volume using number of sets (fallback if no volume field exists).
        const recentVolume =
            (existing?.recentVolume || 0) +
            (log.sets?.length || 0);

        statsMap.set(log.exerciseId, {
            exerciseId: log.exerciseId,
            lastPerformedAt,
            timesPerformed,
            recentVolume
        });
    }

    return statsMap;
}
