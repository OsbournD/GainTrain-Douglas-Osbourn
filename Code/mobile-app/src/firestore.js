import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "./firebase";
import { systemExercises } from "./data/exercises";

export async function addTestUser() { // for testing only.
    try {
        const existingTestUsersQuery = query(
            collection(db, "users"),
            where("username", ">=", "firestoreTestUser_"),
            where("username", "<=", "firestoreTestUser_\uf8ff") // just so it doesnt accidentally grab other users.
        );

        const existingTestUsers = await getDocs(existingTestUsersQuery);
        const count = existingTestUsers.size + 1;

        const username = `firestoreTestUser_${count}`;
        const uid = `uid_firestoreTestUser_${count}`;

        const userData = {
            username,
            uid,
            createdAt: new Date(),
            friends: []
        };

        await addDoc(collection(db, "users"), userData);

        console.log("Created test user:", username);
        return { success: true };
    }
    catch (e) {
        console.error("Error creating new test user:", e);
        return { success: false, message: e.message };
    }
}

export async function seedTestData() {
    try {
        console.log("Seeding test data...");

        for (const exerciseData of systemExercises) {
            const existingExercisesQuery = query(
                collection(db, "exercises"),
                where("exerciseId", "==", exerciseData.exerciseId)
            );

            const existingExercises = await getDocs(existingExercisesQuery);

            if (!existingExercises.empty) {
                const existingDoc = existingExercises.docs[0];
                const exerciseRef = doc(db, "exercises", existingDoc.id);

                await updateDoc(exerciseRef, exerciseData);

                console.log("Exercise updated:", exerciseData.exerciseId);
            } else {
                const exerciseRef = await addDoc(collection(db, "exercises"), exerciseData);
                console.log("Exercise created:", exerciseData.exerciseId);
            }

        }

        const existingUserQuery = query(
            collection(db, "users"),
            where("username", "==", "TestUser")
        );

        const existingUsers = await getDocs(existingUserQuery);

        let userUid;

        if (!existingUsers.empty) {
            console.log("TestUser already exists, skipping creation.");
            userUid = existingUsers.docs[0].data().uid;
        } else {
            const userData = {
                username: "TestUser",
                uid: "uid_testUser",
                pushToken: null,
                friends: [],
                createdAt: new Date(),
                experienceLevel: 2,
                goal: "muscle_gain",
                likedBodyParts: ["chest", "triceps"],
                dislikedBodyParts: ["legs"],
                likedExercises: ["barbell_bench_press"],
                dislikedExercises: ["barbell_squat"],
                weightUnitPreference: "kg",
                customSessionTags: ["hypertrophy_block"]
            };
            const userRef = await addDoc(collection(db, "users"), userData);
            console.log("TestUser created:", userRef.id);
            userUid = userData.uid;
        }

        const existingLogQuery = query(
            collection(db, "exerciseLogs"),
            where("uid", "==", userUid),
            where("exerciseId", "==", "barbell_bench_press")
        );

        const existingLogs = await getDocs(existingLogQuery);

        let exerciseLogId;

        if (!existingLogs.empty) {
            console.log("Test exercise log already exists, skipping creation.");
            exerciseLogId = existingLogs.docs[0].id;
        } else {

            const exerciseLogData = {
                uid: userUid,
                exerciseName: "Barbell Bench Press",
                exerciseId: "barbell_bench_press",
                loggedAt: new Date(),
                location: "gym",
                notes: "TEST EXERCISE LOG!",
                sets: [
                    { weight: 50, reps: 8, equipment: [], modifiers: ["2 second paused reps"], rpe: 7 },
                    { weight: 70, reps: 10, equipment: [], modifiers: [], rpe: 9 },
                    { weight: 80, reps: 12, equipment: ["wrist wraps"], modifiers: ["3 second negative reps"], rpe: 10 }
                ]
            };

            const exerciseLogRef = await addDoc(collection(db, "exerciseLogs"), exerciseLogData);
            console.log("Exercise log created:", exerciseLogRef.id);
            exerciseLogId = exerciseLogRef.id;
        }

        const existingSessionQuery = query(
            collection(db, "sessions"),
            where("uid", "==", userUid)
        );

        const existingSessions = await getDocs(existingSessionQuery);

        if (!existingSessions.empty) {
            console.log("Test session already exists, skipping creation.");
        } else {
            const sessionData = {
                uid: userUid,
                sessionName: "Push Day",
                startedAt: new Date(Date.now() - 3600000),
                endedAt: new Date(),
                location: "gym",
                notes: "TEST SESSION!",
                exerciseLogs: [exerciseLogId],
                tags: ["upper_body", "chest_day"],
                templateUsed: null
            };

            const sessionRef = await addDoc(collection(db, "sessions"), sessionData);
            console.log("Session created:", sessionRef.id);
        }

        console.log("Test data added successfully!");
        return { success: true };
    }
    catch (e) {
        console.error("Error adding test data:", e);
        return { success: false, message: e.message };
    }
}

export async function usernameCheck(username) {
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, where("username", "==", username));
    const queryResult = await getDocs(usersQuery);

    return !queryResult.empty; // returns true if username is taken.
}

export async function addUser(username, password) { // to sign up with custom username and password (uses fake email for auth).
    try {
        if (await usernameCheck(username)) {
            console.log('Username ' + username + ' already taken.');
            return { success: false, message: "Username already taken."};
        }

        // creating firebase auth account.
        const emailAlias = `${username}@example.com`;
        const userCredentials = await createUserWithEmailAndPassword(
            auth,
            emailAlias,
            password
        );

        await addDoc(collection(db, "users"),{ // add data to firestore.
            username,
            uid: userCredentials.user.uid,
            createdAt: new Date(),
            experienceLevel: null,
            onboardingCompleted: false,
        });

        console.log('User ' + username + ' created successfully!');
        return { success: true, message: "Account created!"};

    } catch (e) {
        console.error("Error adding user: ", e);
        return { success: false, message: e.message };
    }

}

export async function verifyUserLogin(username, password) {

    try {
        const emailAlias = `${username}@example.com`;
        const userCredentials = await signInWithEmailAndPassword(
            auth,
            emailAlias,
            password
        );
        console.log('User ' + username + ' logged in.');
        return { success: true, message: "Login successful!" };

    } catch (e) {
        console.error("Login error: ", e);
        return { success: false, message: "Invalid username or password."};
    }

}

export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("User logged out.");
        return { success: true };

    } catch (e) {
        console.error("Logout failed: ", e);
        return { success: false, message: e.message };
    }
}

export async function sendFriendRequest(from, to) {
    try {

        if (from === to) {
            return { success: false, message: "You cannot add yourself as a friend, sorry!"}
        }

        const usersQuery = query(collection(db, "users"), where("username", "==", to));
        const queryResult = await getDocs(usersQuery);

        if (queryResult.empty) {
            return { success: false, message: "User does not exist." };
        }

        const userFromQuery = query(collection(db, "users"), where("username", "==", from));
        const userFromDocs = await getDocs(userFromQuery);

        if (!userFromDocs.empty) {
            const userData = userFromDocs.docs[0].data();

            if (userData.friends && userData.friends.includes(to)) {
                return { success: false, message: "You are already friends with " + to };
            }
        }

        const duplicatePendingQuery = query(collection(db, "friendRequests"), where("from", "==", from), where ("to", "==", to), where("status", "==", "pending"));

        const duplicatePendingCheck = await getDocs(duplicatePendingQuery);

        if (!duplicatePendingCheck.empty) {
            return { success: false, message: "Request already sent to " + to };
        }

        const reversePendingQuery = query(collection(db, "friendRequests"), where("from", "==", to), where ("to", "==", from), where("status", "==", "pending"));

        const reversePendingCheck = await getDocs(reversePendingQuery);

        if (!reversePendingCheck.empty) {
            return { success: false, message: to + " Already sent you a request!" };
        }

        await addDoc(collection(db, "friendRequests"), {
            from,
            to,
            status: "pending",
            sentAt: new Date(),
        });

        const usersRef = collection(db, "users");
        const recipientQuery = query(usersRef, where("username", "==", to));
        const recipientDocs = await getDocs(recipientQuery);

        if (!recipientDocs.empty) {
            const recipient = recipientDocs.docs[0].data();

            if (recipient.pushToken) {
                try {
                    const response = await fetch("https://exp.host/--/api/v2/push/send", {
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            to: recipient.pushToken,
                            sound: "default",
                            title: "New Friend Request",
                            body: `${from} sent you a friend request!`,
                            data: { sender: from }

                        })
                    });

                    const result = await response.json();
                    console.log("Expo push response: ", result);

                } catch (e) {
                    console.log("Push notification fetch failed: ", e);
                }


            }

        }

        return { success: true };

    } catch (e) {
        console.error("Error sending friend request: ", e);
        return { success: false, message: e.message };
    }
}

export async function getIncomingRequests(username) {
    try {
        const friendRequestsQuery = query(collection(db, "friendRequests"), where("to", "==", username), where("status", "==", "pending"));
        const queryResult = await getDocs(friendRequestsQuery);

        const requests = queryResult.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return requests;

    } catch (e) {
        console.error("Error getting incoming requests: ", e);
        return[];
    }

}

export async function denyFriendRequest(requestId) {
    try {
        const requestRef = doc(db, "friendRequests", requestId);

        await updateDoc(requestRef, {
            status: "denied",
            deniedAt: new Date(),
        });

        console.log("Request " + requestId + " denied.");
        return { success: true };

    } catch (e) {
        console.error("Error denying request: ", e);
        return { success: false, message: e.message };
    }
}

export async function acceptFriendRequest(requestId, userA, userB) {
    try {
        const usersRef = collection(db, "users");

        const userAQuery = query(usersRef, where("username", "==", userA));
        const userADocs = await getDocs(userAQuery);

        const userBQuery = query(usersRef, where("username", "==", userB));
        const userBDocs = await getDocs(userBQuery);

        if (userADocs.empty || userBDocs.empty) {
            return { success: false, message: "User not found."};
        }

        const userARef = doc(db, "users", userADocs.docs[0].id);
        const userBRef = doc(db, "users", userBDocs.docs[0].id);

        await updateDoc(userARef, {
            friends: arrayUnion(userB)
        });

        await updateDoc(userBRef, {
            friends: arrayUnion(userA)
        });

        const requestRef = doc(db, "friendRequests", requestId);

        await updateDoc(requestRef, {
            status: "accepted",
            acceptedAt: new Date(),
        });

        console.log("Request " + requestId + " accepted.");
        return { success: true };

    } catch (e) {
        console.error("Error accepting request: ", e);
        return { success: false, message: e.message };
    }

}

export async function removeFriend(userA, userB) {
    try {

        const usersRef = collection(db, "users");

        const userAQuery = query(usersRef, where("username", "==", userA));
        const userADocs = await getDocs(userAQuery);

        const userBQuery = query(usersRef, where("username", "==", userB));
        const userBDocs = await getDocs(userBQuery);

        if (userADocs.empty || userBDocs.empty) {
            return { success: false, message: "User not found."};
        }

        const userARef = doc(db, "users", userADocs.docs[0].id);
        const userBRef = doc(db, "users", userBDocs.docs[0].id);

        await updateDoc(userARef, {
            friends: arrayRemove(userB)
        });

        await updateDoc(userBRef, {
            friends: arrayRemove(userA)
        });

        console.log("Friend status removed between " + userA + " and " + userB);
        return { success: true };

    } catch (e) {
        console.error("Error removing friend: ", e);
        return { success: false, message: e.message };
    }
}


export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}