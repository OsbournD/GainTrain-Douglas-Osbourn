// STEP 11 - Combines all scoring components into a final weighted score.

import { ExerciseMeta, RecommendationInput, ScoredExercise } from "../types";

export function combineScores(
    exercise: ExerciseMeta,
    components: {
        usage: number;
        rest: number;
        variety: number;
        difficulty: number;
        risk: number;
        preferences: number;
        social: number;
        goal: number;
    }
): ScoredExercise {

    const base = 0; // Future use, adding global challenges with recommended exercise boosts?

    const finalScore =
        base +
        components.usage +
        components.rest +
        components.variety +
        components.difficulty +
        components.risk +
        components.preferences +
        components.social +
        components.goal;

    return {
        exercise,
        score: finalScore,
        components: {
            base,
            ...components
        }
    };
}
