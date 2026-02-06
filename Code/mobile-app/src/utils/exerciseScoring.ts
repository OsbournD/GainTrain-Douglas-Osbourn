export function normaliseMuscleName(rawMuscle: string | null | undefined): string {

    // Normalises the muscle names to ensure that user created exercises are consistent and map to
    // a key. (e.g. "Side delt", "side delts" and "lateral deltoid" all map to "side_delts")

    if (!rawMuscle) return "other"; // Fallback for if no muscle is present.

    const muscleName = rawMuscle.trim().toLowerCase();

    if (muscleName.includes("bicep")) return "biceps";
    if (muscleName.includes("tricep")) return "triceps";
    if (muscleName.includes("forearm")) return "forearms";

    if (muscleName.includes("side") && muscleName.includes("delt")) return "side_delts";
    if (muscleName.includes("lateral") && muscleName.includes("delt")) return "side_delts";
    if (muscleName.includes("medial") && muscleName.includes("delt")) return "side_delts";
    if (muscleName.includes("mid") && muscleName.includes("delt")) return "side_delts";
    if (muscleName.includes("rear") && muscleName.includes("delt")) return "rear_delts";
    if (muscleName.includes("posterior") && muscleName.includes("delt")) return "rear_delts";
    if (muscleName.includes("anterior") && muscleName.includes("delt")) return "front_delts";
    if (muscleName.includes("front") && muscleName.includes("delt")) return "front_delts";

    if (muscleName.includes("lats")) return "lats";
    if (muscleName.includes("latissimus")) return "lats";
    if (muscleName === "lat" || muscleName.startsWith("lat ")) return "lats";

    if (muscleName.includes("trap")) return "traps";
    if (muscleName.includes("shoulder")) return "shoulders";
    if (muscleName.includes("chest") || muscleName.includes("pec")) return "chest";
    if (muscleName.includes("lower") && muscleName.includes("back")) return "lower_back";
    if (muscleName.includes("upper") && muscleName.includes("back")) return "upper_back";
    if (muscleName.includes("mid") && muscleName.includes("back")) return "mid_back";
    if (muscleName.includes("back")) return "back";

    if (muscleName.includes("core") || muscleName.includes("abs") || muscleName.includes("abdominal")) return "core";
    if (muscleName.includes("quad")) return "quads";
    if (muscleName.includes("hamstring")) return "hamstrings";
    if (muscleName.includes("posterior") && muscleName.includes("chain")) return "hamstrings";
    if (muscleName.includes("glute")) return "glutes";
    if (muscleName.includes("hip")) return "glutes";
    if (muscleName.includes("calf")) return "calves";
    if (muscleName.includes("calve")) return "calves";
    if (muscleName.includes("adductor") || muscleName.includes("inner")) return "adductors";
    if (muscleName.includes("abductor") || muscleName.includes("outer")) return "abductors";

    return muscleName; // If nothing matches, just return the cleaned string.
}

export function mapToBroadGroup(muscle: string): string {

    // Maps normalised muscles to broader training categories.
    // Used for different types of goals (i.e. do 10 pull exercises)
    // and potentially for session balancing with recommendation??

    if (muscle === "biceps") return "pull";
    if (muscle === "triceps") return "push";
    if (muscle === "forearms") return "pull";

    if (muscle === "side_delts") return "push";
    if (muscle === "rear_delts") return "pull";
    if (muscle === "front_delts") return "push";

    if (muscle === "lats") return "pull";
    if (muscle === "traps") return "pull";
    if (muscle === "shoulders") return "push";

    if (muscle === "chest") return "push";

    if (muscle === "lower_back") return "core";
    if (muscle === "upper_back") return "pull";
    if (muscle === "mid_back") return "pull";
    if (muscle === "back") return "pull";

    if (muscle === "core") return "core";

    if (muscle === "quads") return "legs";
    if (muscle === "hamstrings") return "legs";
    if (muscle === "glutes") return "legs";
    if (muscle === "calves") return "legs";
    if (muscle === "adductors") return "legs";
    if (muscle === "abductors") return "legs";

    return "other";
}

export function getBasePointsFromDifficulty(difficultyValue: number | null | undefined): number {

    // Converts exercise difficulty (1-5) into a base score.
    // Gives harder exercises a higher starting value before multipliers are added.
    const difficultyNumber = Number(difficultyValue);

    // Fallback for invalid or missing values.
    if (isNaN(difficultyNumber) || difficultyNumber < 1 || difficultyNumber > 5) return 10; // default value.
    return 6 + difficultyNumber * 2; // Linear scaling by 2 points per difficulty level.
}

export function getMuscleWeight(muscle: string): number {

    // Weighting system for muscle groups, larger muscle = higher score, smaller = less.
    const muscleWeightMap: Record<string, number> = {
        quads: 1.0,
        hamstrings: 1.0,
        glutes: 1.0,
        back: 1.0,
        chest: 1.0,
        lats: 1.0,
        adductors: 1.0,
        abductors: 1.0,

        shoulders: 0.9,
        side_delts: 0.9,
        rear_delts: 0.9,
        front_delts: 0.9,
        traps: 0.9,
        upper_back: 0.9,
        mid_back: 0.9,
        biceps: 0.9,
        triceps: 0.9,

        calves: 0.8,
        forearms: 0.7,

        core: 0.7,
        lower_back: 0.7,

        other: 0.5
    };

    // Unknown muscles default to 0.5 to avoid breaking scoring.
    return muscleWeightMap[muscle] ?? 0.5;
}

export function getExperienceMultiplier(experienceLevel: string | null | undefined): number {

    // Adjusts scoring based on user experience.
    if (!experienceLevel) return 1.0;

    const level = experienceLevel.toLowerCase();

    if (level === "beginner") return 1.2;
    if (level === "intermediate") return 1.0;
    if (level === "advanced") return 0.95;
    if (level === "expert") return 0.9;

    return 1.0; // Fallback if irregular level i.e. "Beginar".
}

export function getVolumeFactor(numberOfSets: number): number {

    // More sets = slight boost.
    if (!numberOfSets || numberOfSets <= 1) return 1.0;
    return 1 + (numberOfSets - 1) * 0.1;
}

export function calculatePointsAwarded(

    // Main scoring pipeline, combines difficulty, muscle weighting, experience and volume
    // into a single score.

    difficulty: number,
    primaryMuscle: string,
    secondaryMuscles: string[] | undefined,
    experienceLevel: string | null | undefined,
    numberOfSets: number

): number {

    const basePoints = getBasePointsFromDifficulty(difficulty);

    const normalisedPrimary = normaliseMuscleName(primaryMuscle);
    const primaryWeight = getMuscleWeight(normalisedPrimary);

    let secondaryWeight = 0;

    if (secondaryMuscles && secondaryMuscles.length > 0) {

        const normalisedSecondary = secondaryMuscles.map(normaliseMuscleName);
        const secondaryWeights = normalisedSecondary.map(getMuscleWeight);

        // Secondary muscles are weighed half.
        const averageSecondaryWeight = secondaryWeights.reduce((total, weight) => total + weight, 0) / secondaryWeights.length;

        secondaryWeight = averageSecondaryWeight * 0.5;
    }

    const experienceMultiplier = getExperienceMultiplier(experienceLevel);
    const volumeFactor = getVolumeFactor(numberOfSets);

    // Combine exercise specific components.
    const weightedPoints = basePoints * (primaryWeight + secondaryWeight);

    // Combine all components and round.
    return Math.round(weightedPoints * experienceMultiplier * volumeFactor);
}
