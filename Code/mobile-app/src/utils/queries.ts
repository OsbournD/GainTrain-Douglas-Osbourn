// Firestore query helpers used by the recommender.

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Fetches all system + user-created exercises.
export async function fetchExercises(uid: string) {
    const q = query(collection(db, "exercises"));
    const snap = await getDocs(q);

    return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(ex =>
            ex.type === "system" ||
            (ex.type === "user" && ex.createdBy === uid)
        );

}

// Fetches all logs for a user.
export async function fetchLogs(uid: string) {

    const q = query(
        collection(db, "exerciseLogs"),
        where("uid", "==", uid)
    );

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        loggedAt: doc.data().loggedAt.toDate()
    }));
}

// Fetches user preferences by user id.
export async function fetchUserPreferencesByUid(uid: string) {
    const q = query(
        collection(db, "users"),
        where("uid", "==", uid)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
        throw new Error("User not found.");
    }

    return snap.docs[0].data();
}

// Fetches friend activity.
export async function fetchFriendActivity(friends: string[]) {
    const activity = [];

    for (const friend of friends) {
        const q = query(
            collection(db, "exerciseLogs"),
            where("uid", "==", friend)
        );

        const snap = await getDocs(q);

        snap.forEach(doc => {
            const data = doc.data();
            activity.push({
                exerciseId: data.exerciseId,
                lastPerformedAt: data.loggedAt.toDate(),
                timesPerformedRecently: 1
            });
        });
    }

    return activity;
}
