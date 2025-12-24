import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../src/firebase";

import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useIsFocused } from '@react-navigation/native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendFriendRequest, getIncomingRequests, denyFriendRequest, acceptFriendRequest, removeFriend } from '../../src/firestore';

export default function FriendsScreen() {

    const [username, setUsername] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [targetUser, setTargetUser] = useState("");
    const [incoming, setIncoming] = useState([]);
    const [friends, setFriends] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => { // when screen is focused, check for login and load logged in username.

        const checkLogin = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');

            if (!storedUser) {
                router.replace('/(auth)/login');
                return;
            }

            setUsername(storedUser);
            setLoadingUser(false);
        }

        if (isFocused) {
            checkLogin();
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

    if (loadingUser) { // load spinner if checking login.
        return (
            <View style = {{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size = "large" />
            </View>
        )
    }

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
            router.push('/(app)/dashboard');
        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    return(

        <View style={{ flex: 1 }}>

            <ThemedView style={ styles.headerContainer }>
                <ThemedText type="title">Friends</ThemedText>
            </ThemedView>

            <View style = {{ marginTop: 10 }} padding = "20" >
                <Button title = "Back to Dashboard" onPress = { backToDashboardClicked } />
            </View>


            <FlatList

                contentContainerStyle = {{ paddingBottom: 20 }}

                ListHeaderComponent = {

                    <>

                        <View style = { styles.card }>

                            <ThemedText type = "subtitle" padding = "10" >Add a Friend</ThemedText>

                            <TextInput style = { styles.input } placeholder = "Enter a friend's username" value = { targetUser } onChangeText = { setTargetUser } />

                            <Button title = "Send Friend Request" onPress = { sendRequestClicked } />

                        </View>

                        <View style = { styles.card }>

                            <ThemedText type = "subtitle" padding = "10" >Incoming Requests</ThemedText>

                            { incoming.length === 0 ? (
                                <Text style = { styles.placeholderText } > No Incoming Requests </Text>
                            ) : (
                                incoming.map((item) => (
                                    <View key = { item.id } style={ styles.requestBox }>
                                        <Text style = { styles.friendName } > { item.from }</Text>
                                        <Text>Status: { item.status }</Text>
                                        <Text>Sent At: { item.sentAt?.toDate ? item.sentAt.toDate().toLocaleString() : "Unknown" }</Text>

                                        <View style = { styles.buttonRow}>
                                            <View style = { styles.buttonWrapper }>
                                                <Button title = "Accept" color = "green" onPress = { () => acceptClicked(item.id, item.from)}/>
                                            </View>

                                            <View style = { styles.buttonWrapper }>
                                                <Button title = "Deny" color = "red" onPress = { () => denyClicked(item.id) }/>
                                            </View>
                                        </View>

                                    </View>
                                ))
                            )}

                        </View>

                    </>

                }

                ListFooterComponent = {
                    <View style = { styles.card }>

                        <ThemedText type = "subtitle" padding = "10" >Friends</ThemedText>

                        { friends.length === 0 ? (
                            <Text style = { styles.placeholderText } > No Friends Added </Text>
                        ) : (
                            friends.map(( friend ) => (
                                <View key = { friend } style = { styles.friendRow } >
                                    <Text style = { styles.friendName } > { friend } </Text>
                                        <Button title = "Remove Friend" color = "red" onPress = { () => removeFriendClicked(friend)}/>
                                </View>
                            ))
                        )}

                    </View>
                }

            />

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
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        backgroundColor: 'white',
    },
    placeholderText: {
        color: '#555',
        marginVertical: 10,
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 5,
    },
    friendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        marginVertical: 8,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        backgroundColor: 'white',
    },
    friendName: {
        fontSize: 16,
        fontWeight: 'bold',
    },

});
