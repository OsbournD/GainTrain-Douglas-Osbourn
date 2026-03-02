import { RecommendationInput, RecommendationResult } from "../types";
import { computeUserExerciseStats } from "./userStats";
import { filterExercises } from "./filters";
import { scoreUsage } from "./scoring/scoreUsage";
import { scoreRest } from "./scoring/scoreRest";
import { scoreVariety } from "./scoring/scoreVariety";
import { scoreDifficulty } from "./scoring/scoreDifficulty";
import { scoreRisk } from "./scoring/scoreRisk";
import { scorePreferences } from "./scoring/scorePreferences";
import { scoreFriendActivity } from "./scoring/scoreFriendActivity";
import { scoreGoal } from "./scoring/scoreGoal";
import { combineScores } from "./scoring/combineScores";
import { rankAndRecommend } from "./rankAndRecommend";
import { generateExplanation } from "./generateExplanations";

export function recommend(input: RecommendationInput): RecommendationResult {

    const stats = computeUserExerciseStats(input.logs);
    const filtered = filterExercises(input);

    // Build muscle history map.
    const muscleHistory = new Map<string, Date>();
    for (const log of input.logs) {
        const ex = input.exercises.find(e => e.id === log.exerciseId);
        if (!ex) continue;

        const last = log.loggedAt;

        const primary = ex.primaryMuscle;
        const existingPrimary = muscleHistory.get(primary);
        if (!existingPrimary || last > existingPrimary) {
            muscleHistory.set(primary, last);
        }

        for (const sec of ex.secondaryMuscles) {
            const existingSec = muscleHistory.get(sec);
            if (!existingSec || last > existingSec) {
                muscleHistory.set(sec, last);
            }
        }
    }

    const scoredList = [];

    for (const ex of filtered) {
        const stat = stats.get(ex.exerciseId);

        const usage = scoreUsage(ex, stat);
        const rest = scoreRest(ex, muscleHistory);
        const variety = scoreVariety(ex, stat);
        const difficulty = scoreDifficulty(ex, input.userPreferences);
        const risk = scoreRisk(ex, input.userPreferences);
        const preferences = scorePreferences(ex, input.userPreferences);
        const social = scoreFriendActivity(ex, input);
        const goalScore = scoreGoal(ex, input.userPreferences);

        const scored = combineScores(ex, {
            usage,
            rest,
            variety,
            difficulty,
            risk,
            preferences,
            social,
            goal: goalScore
        });

        scored.explanation = generateExplanation(scored);

        scoredList.push(scored);
    }

    return rankAndRecommend(scoredList);
}
