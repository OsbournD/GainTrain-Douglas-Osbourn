export const exerciseIdToName: Record<string, string> = {
    barbell_bench_press: "Bench Press",
    barbell_back_squat: "Squat",
    conventional_barbell_deadlift: "Deadlift",
    cable_lat_pulldown: "Lat Pulldown",
    barbell_overhead_press: "Overhead Press",
    barbell_row: "Barbell Row",
    standing_dumbbell_lateral_raise: "Dumbbell Lateral Raise",
    leg_extension: "Leg Extension",
    leg_press: "Leg Press",
    barbell_bicep_curl: "Barbell Bicep Curl",
};

export const formatExerciseName = ( id: string ) => {
    return exerciseIdToName[id] || id;
};
