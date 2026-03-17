// Computes user activity summary for dashboard.

import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { fetchExercises } from "./queries";

export async function computeUserSummary(uid: string) {

    const now = new Date();

    // Sessions this week.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessionsThisWeekQuery = query(
        collection(db, "sessions"),
        where("uid", "==", uid),
        where("endedAt", ">=", sevenDaysAgo)
    );

    const sessionsThisWeekSnap = await getDocs(sessionsThisWeekQuery);
    const sessionsThisWeek = sessionsThisWeekSnap.size;

    // Sessions for streak calculation.
    const allSessionsQuery = query(
        collection(db, "sessions"),
        where("uid", "==", uid),
        orderBy("endedAt", "desc")
    );

    const allSessionsSnap = await getDocs(allSessionsQuery);
    const allSessions = allSessionsSnap.docs.map(doc => doc.data()); // Raw session data.

    const weeklyStreak = calculateWeeklyStreak(allSessions);

    // Exercises this month.
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const logsQuery = query(
        collection(db, "exerciseLogs"),
        where("uid", "==", uid),
        where("loggedAt", ">=", firstOfMonth)
    );

    const logsSnap = await getDocs(logsQuery);
    const logs = logsSnap.docs.map(doc => doc.data()); // Exercise logs this month.
    const exercisesThisMonth = logs.length;

    // Most frequent muscle group.
    const exercises = await fetchExercises(uid);

    const muscleCount: Record<string, number> = {};

    logs.forEach(log => {
        const exercise = exercises.find(e => e.id === log.exerciseId);
        if (exercise && exercise.primaryMuscle) {
            const primary = exercise.primaryMuscle;
            muscleCount[primary] = (muscleCount[primary] || 0) + 1;
        }
    });

    let topMuscleGroup: string | null = null;

    if (Object.keys(muscleCount).length > 0) {
        topMuscleGroup = Object.entries(muscleCount)
            .sort((a, b) => b[1] - a[1])[0][0]; // Highest count.
    }

    return {
        weeklyStreak,
        sessionsThisWeek,
        exercisesThisMonth,
        topMuscleGroup,
    };
}

// Weekly streak using 7 day windows.
function calculateWeeklyStreak(allSessions: any[]) {

    if (!allSessions || allSessions.length === 0) return 0;

    const sessionDates = allSessions
        .map(session => session.endedAt.toDate())
        .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let cursor = new Date();

    while (true) {
        const windowStart = new Date(cursor);
        windowStart.setDate(windowStart.getDate() - 7); // 7 day block.

        const hasSession = sessionDates.some(date =>
            date >= windowStart && date <= cursor
        );

        if (!hasSession) break;

        streak++;
        cursor = windowStart;
    }

    return streak;
}
