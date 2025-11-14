import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCaNeMuTNt7mn5-7bRzGJd-tHLZhQnQbJU",
  authDomain: "gaintrain-158df.firebaseapp.com",
  projectId: "gaintrain-158df",
  storageBucket: "gaintrain-158df.firebasestorage.app",
  messagingSenderId: "944270050231",
  appId: "1:944270050231:web:cfb16b37ae4816e89c9e32",
  measurementId: "G-14KGWW5DP9"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export default app;