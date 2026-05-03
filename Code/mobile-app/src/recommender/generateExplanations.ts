// Returns the single strongest reason why an exercise was recommended.

import { ScoredExercise } from "./types.ts";

export function generateExplanation(scored: ScoredExercise): string {
    const recommendedEx = scored.components;
    const ex = scored.exercise;

    // Collect recommended exercise reasons with priority scores.
    const reasons: { score: number; text: string }[] = [];

    // Variety-based reasons.
    if (recommendedEx.variety === 20) {
        reasons.push({
            score: 90,
            text: "This is a new exercise for you, so it can help expand your routine."
        });
    } else if (recommendedEx.variety === 10) {
        reasons.push({
            score: 75,
            text: "You haven't done this exercise recently, so it helps add variety to your routine."
        });
    }

    // Usage-based reasons (global popularity + user frequency).
    if (recommendedEx.usage >= 30) {
        // High usage score = popular + user hasn't done it.
        reasons.push({
            score: 90,
            text: "This is a popular exercise you haven't done recently, making it a strong choice for variety."
        });
    } else if (recommendedEx.usage >= 20) {
        // Moderate usage score = user hasn't done it recently.
        reasons.push({
            score: 75,
            text: "You haven't done this exercise recently, so it helps add variety to your routine."
        });
    } else if (recommendedEx.usage <= 5) {
        // Low usage score = user performs it often.
        reasons.push({
            score: 40,
            text: "You've performed this exercise recently, so it's still familiar in your routine."
        });
    }

    // Rest-based reason.
    if (recommendedEx.rest < 0) {
        reasons.push({
            score: 30,
            text: "This targets a muscle group you trained recently, so it was scored lower for recovery."
        });
    }

    // Difficulty-based reasons.
    if (recommendedEx.difficulty >= 15) {
        reasons.push({
            score: 60,
            text: "This matches your experience level well."
        });
    } else if (recommendedEx.difficulty <= 5) {
        reasons.push({
            score: 40,
            text: "This may be challenging for your current experience level."
        });
    }

    // Risk-based reasons.
    if (recommendedEx.risk <= -8) {
        reasons.push({
            score: 70,
            text: "This exercise has a higher risk rating, so it was scored more cautiously."
        });
    } else if (recommendedEx.risk >= -2) {
        reasons.push({
            score: 60,
            text: "This exercise has a low risk rating."
        });
    }

    // Preference-based reasons.
    if (recommendedEx.preferences > 0) {
        reasons.push({
            score: 100,
            text: "This matches your likes or preferred muscle groups."
        });
    } else if (recommendedEx.preferences < 0) {
        reasons.push({
            score: 100,
            text: "You’ve disliked this exercise before."
        });
    }

    // Social-based reason.
    if (recommendedEx.social > 0) {
        reasons.push({
            score: 75,
            text: "Your friends have done this recently."
        });
    }

    // Fallback if no reasons were generated.
    if (reasons.length === 0) {
        return "Recommended based on your overall training pattern.";
    }

    // Pick the highest priority reason.
    reasons.sort((a, b) => b.score - a.score);
    return reasons[0].text;
}
