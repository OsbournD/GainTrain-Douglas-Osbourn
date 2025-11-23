import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";

import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useIsFocused } from '@react-navigation/native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendFriendRequest, getIncomingRequests, denyFriendRequest, acceptFriendRequest } from '../../src/firestore';

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

    const loadRequests = async () => {
        if (!username) {
            return;
        }
        const requests = await getIncomingRequests(username);
        setIncoming(requests);
    };

    const loadFriends = async () => {
        if (!username) {
            return;
        }
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, where("username", "==", username));
        const userDocs = await getDocs(userQuery);

        if (!userDocs.empty) {
            const data = userDocs.docs[0].data();
            setFriends(data.friends || []);
        }
    };


    useEffect(() => {
        loadRequests();
        loadFriends();
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
        loadRequests();
    }

    const denyClicked = async (requestId) => {
        const result = await denyFriendRequest(requestId);

        if(result.success) {
            Alert.alert("Request denied.");
            loadRequests();
        } else {
            Alert.alert("Error denying request.");
        }
    }

    const acceptClicked = async (requestId, fromUser) => {
        if (!username) return;

        const result = await acceptFriendRequest(requestId, username, fromUser);

        if (result.success) {
            Alert.alert("Friend request accepted.");
            loadRequests();
            loadFriends();
        } else {
            Alert.alert("Error accepting request.");
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
