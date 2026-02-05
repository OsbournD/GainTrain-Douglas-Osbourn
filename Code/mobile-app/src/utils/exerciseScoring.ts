export function normaliseMuscleName(rawMuscle: string | null | undefined): string {

    if (!rawMuscle) return "other"; // fallback

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

    return muscleName;
}

export function mapToBroadGroup(muscle: string): string {

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

    const difficultyNumber = Number(difficultyValue);
    if (isNaN(difficultyNumber) || difficultyNumber < 1 || difficultyNumber > 5) return 10; // default value.
    return 6 + difficultyNumber * 2;
}

export function getMuscleWeight(muscle: string): number {

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

    return muscleWeightMap[muscle] ?? 0.5;
}

export function getExperienceMultiplier(experienceLevel: string | null | undefined): number {

    if (!experienceLevel) return 1.0;

    const level = experienceLevel.toLowerCase();

    if (level === "beginner") return 1.2;
    if (level === "intermediate") return 1.0;
    if (level === "advanced") return 0.95;
    if (level === "expert") return 0.9;

    return 1.0; // fallback if weird level i.e. "Beginar".
}

export function getVolumeFactor(numberOfSets: number): number {

    if (!numberOfSets || numberOfSets <= 1) return 1.0;
    return 1 + (numberOfSets - 1) * 0.1;
}

export function calculatePointsAwarded(

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

        const averageSecondaryWeight =
            secondaryWeights.reduce((total, weight) => total + weight, 0) / secondaryWeights.length;

        secondaryWeight = averageSecondaryWeight * 0.5;
    }

    const experienceMultiplier = getExperienceMultiplier(experienceLevel);
    const volumeFactor = getVolumeFactor(numberOfSets);

    const weightedPoints = basePoints * (primaryWeight + secondaryWeight);

    return Math.round(weightedPoints * experienceMultiplier * volumeFactor);
}
