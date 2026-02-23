// STEP 11 - Rank exercises by score and then split into primary and alternative recommendations.

import { ScoredExercise, RecommendationResult } from "./types.ts";

export function rankAndRecommend(
    scored: ScoredExercise[]
): RecommendationResult {

    // Sort descending by score.
    const sorted = [...scored].sort((a, b) => b.score - a.score);

    // Top 2 as primary recommendations.
    const primary = sorted.slice(0, 2);

    // Next 2–5 as alternatives.
    const alternatives = sorted.slice(2, 6);

    return {
        primary,
        alternatives
    };
}
