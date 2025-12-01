import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../src/firebase";

import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useIsFocused } from '@react-navigation/native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendFriendRequest, getIncomingRequests, denyFriendRequest, acceptFriendRequest, removeFriend } from '../../src/firestore';

export default function FriendsScreen() {

    const [username, setUsername] = useState<string | null>(null);
    const [targetUser, setTargetUser] = useState("");
    const [incoming, setIncoming] = useState([]);
    const [friends, setFriends] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => { // when screen is focused, load logged in username.
        const loadUsername = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            setUsername(storedUser);
        }
        if (isFocused) {
             loadUsername();
        }
    }, [isFocused]);


    useEffect(() => {
        if (!username) return;

        const requestsQuery = query( // listen for incoming requests.
            collection(db, "friendRequests"),
            where("to", "==", username),
            where("status", "==", "pending")
        );

        const stopRequestsListening = onSnapshot(requestsQuery, snapshot => {
            const updated = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setIncoming(updated);
        });

        const userQuery = query( // listen for friend list change.
            collection(db, "users"),
            where("username", "==", username)
        );

        const stopFriendsListening = onSnapshot(userQuery, snapshot => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                setFriends(data.friends || []);
            }
        });

        return () => {
            stopRequestsListening();
            stopFriendsListening();
        }

    }, [username]);



    const sendRequestClicked = async () => {

        if (!username) {
            return;
        }

        if (!targetUser.trim()) {
            Alert.alert("Please enter a username");
            return;
        }

        const result = await sendFriendRequest(username, targetUser);

        if (result.success) {
            Alert.alert("Friend request sent to " + targetUser + "!");
        } else {
            Alert.alert(result.message);
        }

        setTargetUser('');
    }

    const denyClicked = async (requestId) => {
        const result = await denyFriendRequest(requestId);

        if(result.success) {
            Alert.alert("Request denied.");
        } else {
            Alert.alert("Error denying request.");
        }
    }

    const acceptClicked = async (requestId, fromUser) => {
        if (!username) return;

        const result = await acceptFriendRequest(requestId, username, fromUser);

        if (result.success) {
            Alert.alert("Friend request accepted.");
        } else {
            Alert.alert("Error accepting request.");
        }
    }

    const removeFriendClicked = async (friendUsername) => {
        if (!username) return;

        const result = await removeFriend(username, friendUsername);

        if (result.success) {
            Alert.alert("Friend removed.");
        } else {
            Alert.alert("Error removing friend.");
        }
    }

    const backToDashboardClicked = async () => {
        try {
            router.push('/(tabs)/dashboard');
        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    return(

        <View style={{ flex: 1 }}>

            <ThemedView style={ styles.headerContainer }>
                <ThemedText type="title">Friends</ThemedText>
            </ThemedView>

            <View style={styles.container}>

                <Button title = "Back to Dashboard" onPress = { backToDashboardClicked } />

                <ThemedText type = "subtitle" style = {{ marginTop: 20 }} >Add a Friend</ThemedText>

                <TextInput style = { styles.input } placeholder = "Enter a friend's username" value = { targetUser } onChangeText = { setTargetUser } />

                <Button title = "Send Friend Request" onPress = { sendRequestClicked } />

                <ThemedText type = "subtitle" style = {{ marginTop: 20 }} >Incoming Requests</ThemedText>

                <FlatList
                    data={incoming}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={ styles.requestBox }>
                            <Text>From: { item.from }</Text>
                            <Text>Status: { item.status }</Text>
                            <Text>Sent At: { item.sentAt?.toDate ? item.sentAt.toDate().toLocaleString() : "Unknown" }</Text>

                            <Button title = "Deny" color = "red" onPress = { () => denyClicked(item.id) }/>
                            <Button title = "Accept" color = "green" onPress = { () => acceptClicked(item.id, item.from)}/>

                        </View>
                    )}

                />

                <ThemedText type = "subtitle" style = {{ marginTop: 20 }} >Friends</ThemedText>

                <FlatList
                    data={friends}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <View style={ styles.requestBox }>
                            <Text>{ item }</Text>

                            <Button title = "Remove Friend" color = "red" onPress = { () => removeFriendClicked(item) }/>
                        </View>
                    )}

                />

            </View>

        </View>
    );

}

const styles = StyleSheet.create({

    headerContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#A1CEDC',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        backgroundColor: 'white',
    },
    requestBox: {
        padding: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        backgroundColor: 'white',
    },
});
