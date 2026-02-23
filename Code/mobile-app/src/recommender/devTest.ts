// Test file for validating recommender steps.
// Run with: npx ts-node -P tsconfig.dev.json src/recommender/devTest.ts

const { computeUserExerciseStats } = require("./userStats");
const { filterExercises } = require("./filters");
const { scoreUsage } = require("./scoring/scoreUsage");
const { scoreRest } = require("./scoring/scoreRest");
const { scoreVariety } = require("./scoring/scoreVariety");
const { scoreDifficulty } = require("./scoring/scoreDifficulty");
const { scoreRisk } = require("./scoring/scoreRisk");
const { scorePreferences } = require("./scoring/scorePreferences");
const { scoreFriendActivity } = require("./scoring/scoreFriendActivity");
const { combineScores } = require("./scoring/combineScores");

import { ExerciseMeta, ExerciseLog, RecommendationInput } from "./types";

// Mock data for testing.

const mockExercises: ExerciseMeta[] = [ // Mock full system exercise catalogue.
    {
        id: "1",
        exerciseId: "bench_press",
        name: "Bench Press",
        primaryMuscle: "chest",
        secondaryMuscles: ["triceps"],
        difficulty: 3,
        riskRating: 2,
        bestFor: ["muscle_gain"],
        tags: [],
        type: "system",
        usageCount: 50
    },
    {
        id: "2",
        exerciseId: "lat_pulldown",
        name: "Lat Pulldown",
        primaryMuscle: "back",
        secondaryMuscles: ["biceps"],
        difficulty: 2,
        riskRating: 1,
        bestFor: ["muscle_gain"],
        tags: [],
        type: "system",
        usageCount: 30
    },
    {
        id: "3",
        exerciseId: "squat",
        name: "Squat",
        primaryMuscle: "quads",
        secondaryMuscles: ["glutes"],
        difficulty: 4,
        riskRating: 3,
        bestFor: ["strength", "muscle_gain"],
        tags: [],
        type: "system",
        usageCount: 20
    },
    {
        id: "4",
        exerciseId: "sit_ups",
        name: "Sit Ups",
        primaryMuscle: "core",
        secondaryMuscles: [],
        difficulty: 1,
        riskRating: 1,
        bestFor: ["muscle_gain"],
        tags: [],
        type: "system",
        usageCount: 10
    }
];

const mockLogs: ExerciseLog[] = [   // Mock user exercise logs.
    {
        id: "log1",
        uid: "u1",
        exerciseId: "bench_press",
        exerciseName: "Bench Press",
        loggedAt: new Date("2026-02-20T10:00:00Z"),
        location: null,
        notes: null,
        sets: [{ weight: 60, reps: 10 }]
    },
    {
        id: "log2",
        uid: "u1",
        exerciseId: "lat_pulldown",
        exerciseName: "Lat Pulldown",
        loggedAt: new Date("2026-02-18T10:00:00Z"),
        location: null,
        notes: null,
        sets: [{ weight: 40, reps: 12 }]
    }
];

const mockInput: RecommendationInput = {    // Combined input object for recommender pipeline.
    exercises: mockExercises,
    logs: mockLogs,
    userPreferences: {
        uid: "u1",
        username: "testUser",
        experienceLevel: "beginner",
        goal: "muscle_gain",
        likedBodyParts: ["back"],
        likedExercises: ["lat_pulldown", "bench_press"],
        dislikedExercises: ["sit_ups"],
        weightUnitPreference: "kg"
    },
    friendActivity: [
        {
            exerciseId: "squat",
            lastPerformedAt: new Date(Date.now() - 192 * 60 * 60 * 1000),   // 8 Days ago.
            timesPerformedRecently: 2
        },
        {
            exerciseId: "lat_pulldown",
            lastPerformedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),   // 3 Days ago.
            timesPerformedRecently: 2
        },
        {
            exerciseId: "bench_press",
            lastPerformedAt: new Date(),   // Today.
            timesPerformedRecently: 1
        },
    ],
    recentSessionExerciseIds: ["bench_press"]   // Only chest should be blocked.
};

// Step 1 — Test userStats.
// Expected output: bench press, performed once, last on 2026-02-20. lat pulldown, performed once, last on 2026-02-18.

console.log("---------------- Step 1: computeUserExerciseStats ----------------");

const stats = computeUserExerciseStats(mockLogs);
console.log("Stats:", stats);

// Build muscle history map for scoreRest.
const muscleHistory = new Map<string, Date>();

for (const log of mockLogs) {
    const exercise = mockExercises.find(e => e.exerciseId === log.exerciseId);
    if (!exercise) continue;

    const last = log.loggedAt;

    // Primary muscle.
    const primary = exercise.primaryMuscle;
    const existingPrimary = muscleHistory.get(primary);
    if (!existingPrimary || last > existingPrimary) {
        muscleHistory.set(primary, last);
    }

    // Secondary muscles.
    for (const sec of exercise.secondaryMuscles) {
        const existingSec = muscleHistory.get(sec);
        if (!existingSec || last > existingSec) {
            muscleHistory.set(sec, last);
        }
    }
}

// Step 2 — Test filters.
// Expected output: ["lat_pulldown", "squat", "sit_ups"].

console.log("---------------- Step 2: filterExercises ----------------");

const filtered = filterExercises(mockInput);
console.log("Filtered exercises:", filtered.map(ex => ex.exerciseId));

// Step 3 — Test scoreUsage.
// Expected result: squat scores highest (user hasn't done it + high usageCount), sit_ups scores moderate, lat_pulldown lowest (user did it session before last).

console.log("---------------- Step 3: scoreUsage ----------------");

for (const ex of filtered) {
    const stat = stats.get(ex.exerciseId);
    const score = scoreUsage(ex, stat);
    console.log(ex.exerciseId, "=", score);
}

// Step 4 — Test scoreRest.

console.log("---------------- Step 4: scoreRest ----------------");

// Utility to create a timestamp number of hours ago.
function hoursAgo(h: number): Date {
    return new Date(Date.now() - h * 60 * 60 * 1000);
}

// Mock exercises for testing primary vs secondary behaviour.
const restTestExercises: ExerciseMeta[] = [
    {
        id: "p1",
        exerciseId: "primary_test",
        name: "Primary Test",
        primaryMuscle: "back",
        secondaryMuscles: [],
        difficulty: 2,
        riskRating: 1,
        bestFor: ["muscle_gain"],
        tags: [],
        type: "system",
        usageCount: 10
    },
    {
        id: "s1",
        exerciseId: "secondary_test",
        name: "Secondary Test",
        primaryMuscle: "core",
        secondaryMuscles: ["back"],
        difficulty: 1,
        riskRating: 1,
        bestFor: ["muscle_gain"],
        tags: [],
        type: "system",
        usageCount: 5
    },
    {
        id: "s2",
        exerciseId: "multi_secondary_test",
        name: "Multi Secondary Test",
        primaryMuscle: "core",
        secondaryMuscles: ["triceps", "shoulders", "glutes"],
        difficulty: 2,
        riskRating: 1,
        bestFor: ["muscle_gain"],
        tags: [],
        type: "system",
        usageCount: 5
}
];

// Test cases for each scenario.
const restTestCases = [
    {
        label: "< 24h primary = full penalty",
        exercise: restTestExercises[0],
        muscleHistory: new Map([["back", hoursAgo(6)]]),
        expected: -20
    },
    {
        label: "< 48h primary = half penalty",
        exercise: restTestExercises[0],
        muscleHistory: new Map([["back", hoursAgo(30)]]),
        expected: -10
    },
    {
        label: ">= 48h primary = no penalty",
        exercise: restTestExercises[0],
        muscleHistory: new Map([["back", hoursAgo(60)]]),
        expected: 0
    },
    {
        label: "< 24h secondary = small penalty",
        exercise: restTestExercises[1],
        muscleHistory: new Map([["back", hoursAgo(8)]]),
        expected: -5
    },
    {
        label: "Never performed = no penalty",
        exercise: restTestExercises[0],
        muscleHistory: new Map(),
        expected: 0
    },
    {
        label: "Multiple secondary muscles, only one trained recently",
        exercise: restTestExercises[2],
        muscleHistory: new Map([
            ["triceps", hoursAgo(6)],
            ["shoulders", hoursAgo(30)],
            ["glutes", hoursAgo(80)]
        ]),
        expected: -5
    }

];

// Run the test suite.
for (const test of restTestCases) {
    const result = scoreRest(test.exercise, test.muscleHistory);
    console.log(`${test.label}:`, result, "(expected:", test.expected + ")");
}

// Step 5 - scoreVariety.
// Expected result: lat pulldown = 10, squat = 20, sit ups = 20.

console.log("---------------- Step 5: scoreVariety ----------------");

for (const ex of filtered) {
    const stat = stats.get(ex.exerciseId);
    const varietyScore = scoreVariety(ex, stat);
    console.log(ex.exerciseId, "varietyScore =", varietyScore);
}

// Step 6 - scoreDifficulty.
// Expected result: lat pulldown = 20, squat = 10, sit ups = 20.

console.log("---------------- Step 6: scoreDifficulty ----------------");

for (const ex of filtered) {
    const diffScore = scoreDifficulty(ex, mockInput.userPreferences);
    console.log(ex.exerciseId, "difficultyScore =", diffScore);
}

// Step 7 - scoreRisk.
// Expected result: lat pulldown = -2, squat = -10, sit ups = -2

console.log("---------------- Step 7: scoreRisk ----------------");

for (const ex of filtered) {
    const riskScore = scoreRisk(ex, mockInput.userPreferences);
    console.log(ex.exerciseId, "riskScore =", riskScore);
}

// Step 8 - scorePreferences.
// Expected result: lat pulldown = 13, squat = 0, sit ups = -20.

console.log("---------------- Step 8: scorePreferences ----------------");

for (const ex of filtered) {
    const prefScore = scorePreferences(ex, mockInput.userPreferences);
    console.log(ex.exerciseId, "prefScore =", prefScore);
}

// Step 9 - scoreFriendActivity.
// Expected result: lat pulldown = 10, squat = 0, sit ups = 0

console.log("---------------- Step 9: scoreFriendActivity ----------------");

for (const ex of filtered) {
    const friendScore = scoreFriendActivity(ex, mockInput);
    console.log(ex.exerciseId, "friendScore =", friendScore);
}

// Step 10 - combineScores.
// Expected result:
// lat_pulldown finalScore = 76 {
//   base: 0,
//   usage: 25,
//   rest: 0,
//   variety: 10,
//   difficulty: 20,
//   risk: -2,
//   preferences: 13,
//   social: 10
// }
// squat finalScore = 60 {
//   base: 0,
//   usage: 40,
//   rest: 0,
//   variety: 20,
//   difficulty: 10,
//   risk: -10,
//   preferences: 0,
//   social: 0
// }
// sit_ups finalScore = 48 {
//   base: 0,
//   usage: 30,
//   rest: 0,
//   variety: 20,
//   difficulty: 20,
//   risk: -2,
//   preferences: -20,
//   social: 0
// }

console.log("---------------- Step 10: combineScores ----------------");

for (const ex of filtered) {

    const stat = stats.get(ex.exerciseId);

    const usage = scoreUsage(ex, stat);
    const rest = scoreRest(ex, muscleHistory);
    const variety = scoreVariety(ex, stat);
    const difficulty = scoreDifficulty(ex, mockInput.userPreferences);
    const risk = scoreRisk(ex, mockInput.userPreferences);
    const preferences = scorePreferences(ex, mockInput.userPreferences);
    const social = scoreFriendActivity(ex, mockInput);

    const scored = combineScores(ex, {
        usage,
        rest,
        variety,
        difficulty,
        risk,
        preferences,
        social,
    });

    console.log(ex.exerciseId, "finalScore =", scored.score, scored.components);
}

