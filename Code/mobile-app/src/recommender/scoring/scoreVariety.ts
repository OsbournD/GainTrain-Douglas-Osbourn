// STEP 5 - Scores exercises based on how often the user has performed them.

import { ExerciseMeta, UserExerciseStats } from "../types";

export function scoreVariety(
    exercise: ExerciseMeta,
    stats: UserExerciseStats | undefined
): number {

    if (!stats) {    // Never performed = strong boost.
        return 20;
    }

    const count = stats.timesPerformed;

    if (count <= 3) {    // Lightly performed = moderate boost.
        return 10;
    }

    if (count <= 7) {    // Performed occasionally = small boost.
        return 5;
    }

    return 0;    // Performed frequently = no boost.
}
