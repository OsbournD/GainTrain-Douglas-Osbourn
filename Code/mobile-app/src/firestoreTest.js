import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function addUser() {
    try {
        await addDoc(collection(db, "users"), {
            name: "Tester Testington",
            createdAt: new Date(),
        });
        console.log("Test user added!");
    }
    catch (e) {
        console.error("Test user not added", e);
    }
}