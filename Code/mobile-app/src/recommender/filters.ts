import { ExerciseMeta, RecommendationInput } from "./types.ts";
import { normaliseMuscleName } from "../utils/exerciseScoring.ts";

// STEP 2 - Filters exercises that target muscles trained too recently.

export function filterExercises(input: RecommendationInput): ExerciseMeta[] {

    const { exercises, userPreferences, recentSessionExerciseIds } = input;

    // Build set of muscles trained in most recent session.
    const recentMuscles = buildRecentMuscleSet(exercises, recentSessionExerciseIds);

    return exercises.filter(exercise => {

        // Block exact exercises from the most recent session.
        if (recentSessionExerciseIds.includes(exercise.id)) {
            return false;
        }

        // Don't include exercises missing essential fields.
        if (!exercise.primaryMuscle || !exercise.difficulty || !exercise.riskRating) {
            return false;
        }

        // Avoid exercises that hit recently-trained primary muscles.
        const primary = normaliseMuscleName(exercise.primaryMuscle);

        if (recentMuscles.primary.has(primary)) {
            return false;
        }

        return true;
    });
}

// Builds set of muscles trained in most recent session.

function buildRecentMuscleSet(
    exercises: ExerciseMeta[],
    recentSessionExerciseIds: string[]
) {
    const primary = new Set<string>();
    const secondary = new Set<string>();

    for (const id of recentSessionExerciseIds) {

        const exercise = exercises.find(ex => ex.id === id);
        if (!exercise) continue;

        const primaryMuscle = normaliseMuscleName(exercise.primaryMuscle);
        primary.add(primaryMuscle);

        if (exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0) {
            for (const muscle of exercise.secondaryMuscles) {
                const normalisedSecondary = normaliseMuscleName(muscle);
                secondary.add(normalisedSecondary);
            }
        }
    }

    return { primary, secondary };
}
