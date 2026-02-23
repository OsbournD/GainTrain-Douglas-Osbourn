// STEP 9 - Scores exercises based on recent friend activity.

import { ExerciseMeta, RecommendationInput } from "../types";

export function scoreFriendActivity(
    exercise: ExerciseMeta,
    input: RecommendationInput
): number {

    const { friendActivity } = input;

    if (!friendActivity || friendActivity.length === 0) {
        return 0;
    }

    // Define recent as within the last 7 days.
    const now = new Date();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    const wasPerformedByFriend = friendActivity.some(activity => {
        if (activity.exerciseId !== exercise.exerciseId) return false;

        const timeDiff = now.getTime() - new Date(activity.lastPerformedAt).getTime();
        return timeDiff <= sevenDaysMs;
    });

    return wasPerformedByFriend ? 10 : 0;
}
