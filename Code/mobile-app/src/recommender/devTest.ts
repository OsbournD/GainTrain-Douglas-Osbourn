// Test file for validating recommender steps.
// Run with: npx ts-node -P tsconfig.dev.json src/recommender/devTest.ts

const { computeUserExerciseStats } = require("./userStats");
const { filterExercises } = require("./filters");
const { scoreUsage } = require("./scoring/scoreUsage");
const { scoreRest } = require("./scoring/scoreRest");
const { scoreVariety } = require("./scoring/scoreVariety");

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
        likedBodyParts: null,
        likedExercises: null,
        dislikedExercises: null,
        weightUnitPreference: "kg"
    },
    friendActivity: [],
    recentSessionExerciseIds: ["bench_press"]   // Only chest should be blocked.
};

// Step 1 — Test userStats.
// Expected output: bench press, performed once, last on 2026-02-20. lat pulldown, performed once, last on 2026-02-18.

console.log("---------------- Step 1: computeUserExerciseStats ----------------");

const stats = computeUserExerciseStats(mockLogs);
console.log("Stats:", stats);

// Step 2 — Test filtering.
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
