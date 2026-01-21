import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, TextInput, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../../src/firestore';
import { useIsFocused } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../src/firebase";
import { sendFriendRequest, getIncomingRequests, denyFriendRequest, acceptFriendRequest, removeFriend } from '../../src/firestore';

export default function communityPage() {

    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'Feed' | 'Challenges' | 'Friends'>('Feed');

    const backToDashboardClicked = async () => {
        try {
            router.push('/(app)/dashboard');
        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    const settingsClicked = async () => {
        try {
            router.push('../settings');
        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    return(

        <View style={ styles.appBackground }>

            <ThemedView style={styles.headerContainer}>

                    <TouchableOpacity style = { styles.backButton } onPress = { backToDashboardClicked } >
                        <Text style = { styles.headerButtonText }> BACK </Text>
                    </TouchableOpacity>

                    <ThemedText style = { styles.titleText }>Community</ThemedText>

                    <TouchableOpacity style = { styles.headerButton } onPress = { settingsClicked } >
                        <Text style = { styles.headerButtonText }> SETTINGS </Text>
                    </TouchableOpacity>

            </ThemedView>

            <View style = { styles.tabBar }>
                {['Feed', 'Challenges', 'Friends'].map(tab => (
                    <TouchableOpacity
                        key = {tab}
                        style = {[
                            styles.tabButton,
                            activeTab === tab && styles.tabButtonActive
                        ]}
                        onPress = {() => setActiveTab(tab)}
                    >
                        <Text
                            style = {[
                                styles.tabText,
                                activeTab === tab && styles.tabTextActive
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style = {{ flex:1 }}>
                { activeTab === 'Feed' && <FeedContent /> }
                { activeTab === 'Challenges' && <ChallengesContent /> }
                { activeTab === 'Friends' && <FriendsContent /> }
            </View>

        </View>

    );

}

function FeedContent() {
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [feedFilter, setFeedFilter] = useState<'Latest' | 'Popular' | 'Sessions' | 'Friends'>('Latest');
    const [searchQuery, setSearchQuery] = useState('');

    const filters = ['Latest', 'Popular', 'Sessions', 'Friends'];

    const activities = [
        {
            id: '1',
            type: 'session',
            user: 'UserB',
            title: 'Push Day',
            subtitle: 'Bench Press, Overhead Press, Tricep Dips...',
            comment: 'Felt strong today!!',
            time: '1h ago',
            likes: 12,
        },
        {
            id: '2',
            type: 'newFriendExercise',
            user: 'UserC',
            title: 'Conventional Barbell Deadlift',
            subtitle: '50kg x 10, 60kg x 12, 50kg x 8',
            time: '2h ago',
            likes: 9,
        },
        {
            id: '3',
            type: 'newFriend',
            user: 'UserB',
            title: 'New Friend!',
            subtitle: 'Goal: Muscle Gain',
            time: '2 days ago',
            likes: 0,
        },
        {
            id: '4',
            type: 'friendPR',
            user: 'UserD',
            title: 'New PR!',
            subtitle: 'Deadlift — 120kg',
            comment: 'Finally hit this milestone!',
            time: '3 days ago',
            likes: 22,
        }

    ];

    return (
        <View style = {{ flex: 1 }}>

            <View style = {{ position: 'relative', zIndex: 100 }}>

                <View style = { styles.filterSearchRow }>

                    <TouchableOpacity
                        style = { styles.filterButton }
                        onPress = { () => setShowFilterMenu(!showFilterMenu) }
                    >
                        <Text style = { styles.filterButtonText }>{feedFilter}</Text>
                    </TouchableOpacity>

                    <View style = { styles.searchBar }>
                        <TextInput
                            style = { styles.searchInput }
                            placeholder = "Search..."
                            placeholderTextColor = "#49454F"
                            value = { searchQuery }
                            onChangeText = { setSearchQuery }
                        />
                    </View>

                </View>

                {showFilterMenu && (
                    <View style = { styles.dropdownMenu }>
                        {filters.map( option => (
                            <TouchableOpacity
                                key = { option }
                                style = { styles.dropdownItem }
                                onPress = { () => {
                                    setFeedFilter(option);
                                    setShowFilterMenu(false);
                                }}
                            >

                                <Text style = { styles.dropdownItemText }>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <ScrollView style = {{ marginTop: 10 }}>
                {activities.map(activity => (
                    <ActivityCard key = { activity.id } activity = { activity } />
                ))}
                <View>
                    <Text style = { styles.welcomeText }>You've reached the end!</Text>
                </View>
            </ScrollView>

        </View>
    );
}

function ActivityCard({ activity }: { activity: any}) {
    return (
        <View style = { styles.activityCard }>
            <Text style={styles.activityUser}>{activity.user}</Text>

                {activity.type === 'session' && (
                    <>
                        <Text style = { styles.activityTitle }>Logged a session: { activity.title }</Text>
                        <Text style = { styles.activitySubtitle }>{ activity.subtitle }</Text>
                        {activity.comment && (
                            <Text style = { styles.activityComment } >“{ activity.comment }”</Text>
                        )}
                    </>
                )}

                {activity.type === 'newFriendExercise' && (
                    <>
                        <Text style = { styles.activityTitle }>Tried a new exercise</Text>
                        <Text style = { styles.activitySubtitle }>{ activity.title }</Text>
                        <Text style = { styles.activitySubtitle }>{ activity.subtitle }</Text>
                    </>
                )}

                {activity.type === 'newFriend' && (
                    <>
                        <Text style = { styles.activityTitle }>New Friend!</Text>
                        <Text style = { styles.activitySubtitle }>{ activity.subtitle }</Text>
                    </>
                )}

                {activity.type === 'friendPR' && (
                    <>
                        <Text style = { styles.activityTitle }>New PR!</Text>
                        <Text style = { styles.activitySubtitle }>{ activity.subtitle }</Text>
                        {activity.comment && (
                            <Text style = { styles.activityComment }>“{ activity.comment }”</Text>
                        )}
                    </>
                )}

                <View style = { styles.activityMetaRow }>

                    <Text style = { styles.activityTime }>{ activity.time }</Text>

                    {activity.likes > 0 && (
                        <TouchableOpacity style = { styles.metaButton }>
                            <Text style = { styles.metaButtonText }>{ activity.likes } likes</Text>
                        </TouchableOpacity>
                    )}
                </View>

        </View>

    );
}

function ChallengesContent() {
    return (
        <View style = { styles.card }>
            <ThemedText style = { styles.welcomeText }>Challenges</ThemedText>
        </View>
    );
}

function FriendsContent() {

    const [username, setUsername] = useState<string | null>(null);
    const [targetUser, setTargetUser] = useState("");
    const [incoming, setIncoming] = useState([]);
    const [friends, setFriends] = useState([]);

    useEffect(() => {

        const loadUsername = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');

            setUsername(storedUser);
        }

        loadUsername();
    }, []);


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

    return (
        <ScrollView contentContainerStyle = {{ paddingBottom: 20 }}>

            <View style = { styles.spacer }/>

            <View style = { styles.card }>

                <ThemedText type = "subtitle" padding = "10" >Add a Friend</ThemedText>

                <TextInput style = { styles.input } placeholder = "Enter a friend's username" value = { targetUser } onChangeText = { setTargetUser } />

                <TouchableOpacity style = { styles.sendButton } onPress = { sendRequestClicked }>
                    <Text style = {styles.friendButtonText}>Send Friend Request</Text>
                </TouchableOpacity>

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
                                    <TouchableOpacity style = { styles.acceptButton } onPress = { () => acceptClicked(item.id, item.from) }>
                                        <Text style = {styles.friendButtonText}>ACCEPT</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style = { styles.buttonWrapper }>
                                    <TouchableOpacity style = { styles.denyButton } onPress = { () => denyClicked(item.id) }>
                                        <Text style = {styles.friendButtonText}>DENY</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                    ))
                )}

            </View>

            <View style = { styles.card }>

                <ThemedText type = "subtitle" padding = "10" >Friends</ThemedText>

                { friends.length === 0 ? (
                    <Text style = { styles.placeholderText } > No Friends Added </Text>
                ) : (
                    friends.map(( friend ) => (
                        <View key = { friend } style = { styles.friendRow } >
                            <Text style = { styles.friendName } > { friend } </Text>
                            <TouchableOpacity style = { styles.removeButton } onPress = { () => removeFriendClicked(friend) }>
                                <Text style = {styles.friendButtonText}>Remove Friend</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    appBackground: {
        flex: 1,
        backgroundColor: '#E6F3FF',
    },
    headerContainer: {
        height: 100,
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 20,
        position: 'relative',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
        zIndex: 20,
    },
    centerTitle: {
        alignItems: 'center',
        flex: 1,
    },
    headerButton: {
        paddingVertical: 10,
        paddingHorizontal: 2,
        backgroundColor: '#D9D9D9',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        position: 'absolute',
        top: 30,
        right: 12,
        zIndex: 10,
    },
    backButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#D9D9D9',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        position: 'absolute',
        top: 30,
        left: 12,
        zIndex: 10,
    },
    headerButtonText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 20,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    spacer: {
        height: 10,
    },
    titleText: {
        fontSize: 45,
        fontWeight: 'bold',
        color: '#24C3FF',
        position: 'absolute',
        textAlign: 'center',
        lineHeight: 50,
    },
    headingText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#24C3FF',
        paddingBottom: 10,
        textAlign: 'center',
    },
    welcomeText: {
        color: '#757575',
        margin: 20,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 30,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#E6F3FF',
    },
    tabButton: {
        flex: 1,
        backgroundColor: 'white',
        borderColor: '#D9D9D9',
        borderWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    tabButtonActive: {
      backgroundColor: '#E6F3FF',
      borderBottomWidth: 0,
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#646262',
    },
    tabTextActive: {
        color: '#52ABFF',
    },

    filterSearchRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        gap: 10,
    },
    filterButton: {
        flex: 1,
        backgroundColor: '#52ABFF',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    filterButtonText: {
        fontSize: 16,
        color: 'white',
    },
    searchBar: {
        flex: 3,
        backgroundColor: 'white',
        paddingHorizontal: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#7F7E7E',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    searchInput: {
        fontSize: 16,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 65,
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        marginHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        marginTop: 4,
        overflow: 'hidden',
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
        zIndex: 100,
    },
    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
    dropdownItemText: {
        fontSize: 14,
        color: 'black',
    },

    activityCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 20,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    activityUser: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#646262',
        marginBottom: 4,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#24C3FF',
        marginBottom: 4,
    },
    activitySubtitle: {
        fontSize: 14,
        color: '#646262',
        marginBottom: 2,
    },
    activityComment: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#757575',
        marginTop: 4,
    },
    activityMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    metaButton: {
        backgroundColor: '#D9D9D9',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    metaButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#646262',
    },
    activityTime: {
      fontSize: 12,
      color: '#646262',
      fontWeight: 'bold',
    },
    endCard: {
        marginHorizontal: 20,
        marginVertical: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    endText: {
        fontSize: 14,
        color: '#757575',
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
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 5,
    },
    sendButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#52ABFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        alignItems: 'center',
    },
    friendButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    acceptButton: {
        paddingVertical: 4,
        paddingHorizontal: 16,
        backgroundColor: 'green',
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        alignItems: 'center',
    },
    denyButton: {
        paddingVertical: 4,
        paddingHorizontal: 16,
        backgroundColor: 'red',
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        alignItems: 'center',
    },
    removeButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: 'red',
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        alignItems: 'center',
},
});

