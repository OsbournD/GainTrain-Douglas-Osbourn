// Runs the recommender pipeline for a user and caches the result for 24 hours.

import AsyncStorage from "@react-native-async-storage/async-storage";

import { recommend } from "./recommend";
import { RecommendationInput, RecommendationResult } from "./types";

import { fetchExercises, fetchLogs, fetchUserPreferencesByUid, fetchFriendActivity } from "../utils/queries";

// Builds the input object and runs the recommender.
// Uses AsyncStorage to avoid recomputing more than once per day.

export async function runRecommender(uid: string): Promise<RecommendationResult> {

    const cacheKey = `recommendations_${uid}_`;

    // Load cached recommendations.
    const cached = await AsyncStorage.getItem(cacheKey);

    if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;

        // 24 hours.
        if (age < 24 * 60 * 60 * 1000) {
            return parsed.data;
        }
    }

    // Fetch user preferences.
    const userPreferences = await fetchUserPreferencesByUid(uid);

    // Fetch exercises.
    const exercises = await fetchExercises(uid);

    // Fetch logs.
    const logs = await fetchLogs(uid);

    // Fetch friend activity.
    const friends = userPreferences.friends || [];
    const friendActivity = await fetchFriendActivity(friends);

    // Build recent session exercise list.
    const sortedLogs = [...logs].sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());

    const mostRecentDate = sortedLogs.length > 0 ? sortedLogs[0].loggedAt : null;

    // Build recent session exercise list using 6 hour window.
    let recentSessionExerciseIds: string[] = [];

    if (sortedLogs.length > 0) {
        const mostRecentTimestamp = sortedLogs[0].loggedAt.getTime();

        recentSessionExerciseIds = sortedLogs
            .filter(log => {
                const diffHours =
                    Math.abs(mostRecentTimestamp - log.loggedAt.getTime()) /
                    (1000 * 60 * 60);

                return diffHours < 6;
            })
            .map(log => log.exerciseId);
    }

    const input: RecommendationInput = {
        exercises,
        logs,
        userPreferences,
        friendActivity,
        recentSessionExerciseIds,
    };

    // Run the recommender.
    const result = recommend(input);

    // Cache the result.
    await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
            timestamp: Date.now(),
            data: result,
        })
    );

    return result;
}
