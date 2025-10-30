import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function addTestUser() {
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

export async function addUser(username, password) {
    try {
        await addDoc(collection(db, "users"), {
            username: username,
            password: password, // CHANGE LATER WITH FIREBASE AUTH!!
            createdAt: new Date(),

        });
        console.log("User " + username + " added!");
    } catch (e) {
        console.error("Error adding user: ", e);
        throw e;

    }

}