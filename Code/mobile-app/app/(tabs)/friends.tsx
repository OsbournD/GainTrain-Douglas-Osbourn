import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useIsFocused } from '@react-navigation/native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendFriendRequest, getIncomingRequests } from '../../src/firestore';

export default function FriendsScreen() {

    const [username, setUsername] = useState<string | null>(null);
    const [targetUser, setTargetUser] = useState("");
    const [incoming, setIncoming] = useState([]);
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

    useEffect(() => {
        loadRequests();
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
                <ThemedText type="title">Friend Requests</ThemedText>
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
