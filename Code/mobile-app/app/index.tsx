import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { View, ActivityIndicator } from 'react-native';

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../src/firebase";

export default function Index() {

    const router = useRouter();

    useEffect(() => { // redirect based on whether user is logged in.
        const loginCheck = async () => {
            const user = await AsyncStorage.getItem("loggedInUser");

            if (!user) {
                router.replace('/(auth)/login');
                return;
            }

            const usersRef = collection(db, "users");
            const usersQuery = query(usersRef, where("username", "==", user));
            const userDocs = await getDocs(usersQuery);

            if (!userDocs.empty) {
                const userData = userDocs.docs[0].data();
                const onboardingCompleted = userData.onboardingCompleted === true;

                if (!onboardingCompleted) {
                    router.replace('/(onboarding)');
                    return;
                }
            }

            router.replace('/(app)/dashboard');

        }
        loginCheck();
    }, []);

    return (
        <View style = {{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size = "large"/>
        </View>
    );

}