import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "./firebase";

export async function addTestUser() { // for testing only.
    try {
        await addDoc(collection(db, "testUsers"), {
            name: "Tester Testington",
            createdAt: new Date(),
        });
        console.log("Test user added!");
    }
    catch (e) {
        console.error("Test user not added", e);
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

export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}