export const muscleNameMap: Record<string, string> = {
    upper_chest: "Upper Chest",
    mid_chest: "Mid Chest",
    lower_chest: "Lower Chest",

    upper_back: "Upper Back",
    mid_back: "Mid Back",
    lower_back: "Lower Back",
    back: "Back",

    side_delts: "Side Delts",
    front_delts: "Front Delts",
    rear_delts: "Rear Delts",
    shoulders: "Shoulders",

    biceps: "Biceps",
    triceps: "Triceps",
    forearms: "Forearms",

    quads: "Quads",
    hamstrings: "Hamstrings",
    glutes: "Glutes",
    calves: "Calves",
    adductors: "Adductors",
    abductors: "Abductors",

    core: "Core",
};

export const formatMuscleName = (id: string) => {
    if (muscleNameMap[id]) {
        return muscleNameMap[id];
    }

    return id
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
};
