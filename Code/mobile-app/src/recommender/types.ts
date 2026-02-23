// For defining data for the recommender.

// User goal type from onboarding.
export type Goal =
    | "muscle_gain"
    | "strength"
    | "general"
    | null;

// Exercise metadata.
export interface ExerciseMeta {
    id: string;
    exerciseId: string;
    name: string;
    difficulty: number;
    riskRating: number;
    tags: string[];
    primaryMuscle: string;
    secondaryMuscles: string[];
    bestFor: string[];
    usageCount?: number;
    type: "system" | "user";
    createdBy?: string | null;
    createdAt?: Date;
}

// Exercise log metadata.
export interface ExerciseLog {
    id: string;
    uid: string;
    exerciseId: string;
    exerciseName: string;
    loggedAt: Date;
    location: string | null;
    notes: string | null;
    sets: {
        weight: number;
        reps: number;
        rpe?: number;
        equipment?: string[];
        modifiers?: string[];
    }[];
}

// Session metadata.
export interface Session {
    id: string;
    uid: string;
    startedAt: Date;
    endedAt: Date;
    location: string | null;
    notes: string | null;
    exerciseLogs: string[];
    tags: string[];
    templateUsed: string | null;
    name: string;
}

// User preferences metadata.
export interface UserPreferences {
    uid: string;
    username: string;
    experienceLevel: string | null;
    goal: Goal;
    likedBodyParts: string[] | null;
    likedExercises: string[] | null;
    dislikedExercises: string[] | null;
    weightUnitPreferences: "kg" | "lbs";
}

// Computed stats from exercise logs.
export interface UserExerciseStats {
    exerciseId: string;
    lastPerformedAt: Date | null;
    timesPerformed: number;
    recentVolume: number;
}

// Friend activity.
export interface FriendExerciseActivity {
    exerciseId: string;
    lastPerformedAt: Date;
    timesPerformedRecently: number;
}

// Input to the recommender.
export interface RecommendationInput {
    exercises: ExerciseMeta[];
    logs: ExerciseLog[];
    userPreferences: UserPreferences;
    friendActivity: FriendExerciseActivity[];
    recentSessionExerciseIds: string[];
}

// Scored exercise (output with breakdown).
export interface ScoredExercise {
    exercise: ExerciseMeta;
    score: number;
    components: {
        base: number; // For potentially adding boosts for
        // exercises related to global weekly challenges (if i implement them).
        usage: number;
        rest: number;
        variety: number;
        difficulty: number;
        risk: number;
        preferences: number;
        social: number;
        goal: number;
    };
    explanation?: string;
}

// Final recommendation result.
export interface RecommendationResult {
    primary: ScoredExercise[];
    alternatives: ScoredExercise[];
}
