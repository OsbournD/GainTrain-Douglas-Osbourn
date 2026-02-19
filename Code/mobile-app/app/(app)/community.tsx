import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, TextInput, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../../src/firestore';
import { useIsFocused } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { collection, query, where, getDocs, onSnapshot, doc, addDoc, Timestamp, orderBy, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../src/firebase";
import { sendFriendRequest, getIncomingRequests, denyFriendRequest, acceptFriendRequest, removeFriend, acceptChallenge, denyChallenge } from '../../src/firestore';

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

            <ThemedView style = { styles.headerContainer }>

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

    const activities = [  // MOCK DATA!!
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

                { showFilterMenu && (
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
                { activities.map(activity => (
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
            <Text style = { styles.activityUser }>{ activity.user }</Text>

                { activity.type === 'session' && (
                    <>
                        <Text style = { styles.activityTitle }>Logged a session: { activity.title }</Text>
                        <Text style = { styles.activitySubtitle }>{ activity.subtitle }</Text>
                        {activity.comment && (
                            <Text style = { styles.activityComment } >“{ activity.comment }”</Text>
                        )}
                    </>
                )}

                { activity.type === 'newFriendExercise' && (
                    <>
                        <Text style = { styles.activityTitle }>Tried a new exercise</Text>
                        <Text style = { styles.activitySubtitle }>{ activity.title }</Text>
                        <Text style = { styles.activitySubtitle }>{ activity.subtitle }</Text>
                    </>
                )}

                { activity.type === 'newFriend' && (
                    <>
                        <Text style = { styles.activityTitle }>New Friend!</Text>
                        <Text style = { styles.activitySubtitle }>{ activity.subtitle }</Text>
                    </>
                )}

                { activity.type === 'friendPR' && (
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

    const [username, setUsername] = useState<string | null>(null);
    const [activeChallenges, setActiveChallenges] = useState([]);
    const [invites, setInvites] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewChallenge, setViewChallenge] = useState(null);
    const [expiredChallenges, setExpiredChallenges] = useState([]);
    const [completedChallenges, setCompletedChallenges] = useState([]);

    useEffect(() => {
        const loadUsername = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            setUsername(storedUser);
        };

        loadUsername();
    }, []);

    const [friends, setFriends] = useState([]);

    useEffect(() => {   // Retrieving friends list from firestore.
        if (!username) return;

        const userQuery = query(
            collection(db, "users"),
            where("username", "==", username)
        );

        const stopFriendsListening = onSnapshot(userQuery, snapshot => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                setFriends(data.friends || []);
            }
        });

        return () => stopFriendsListening();
    }, [username]);

    useEffect(() => {   // Retrieving challenges from firestore.
        if (!username) return;

        const challengesQuery = query(
            collection(db, "challenges"),
            where("participants", "array-contains", username),
            where("status", "in", ["active", "pending"]),
            orderBy("endDate", "asc")
        );

        const stopListening = onSnapshot(challengesQuery, async snapshot => {
            const now = new Date();

            for (const docSnap of snapshot.docs) {
                const challenge = docSnap.data();
                const id = docSnap.id;

                // Check expiration.
                if (challenge.status === "active" && challenge.endDate.toDate() <= now) {

                    // Mark expired in Firestore.
                    await updateDoc(doc(db, "challenges", id), {
                        status: "expired",
                        expiredAt: new Date(),
                        lastUpdated: new Date()
                    });

                    // Notify all users in challenge.
                    for (const user of challenge.participants) {
                        const userQuery = query(collection(db, "users"), where("username", "==", user));
                        const userDocs = await getDocs(userQuery);

                        if (!userDocs.empty) {
                            const userData = userDocs.docs[0].data();

                            if (userData.pushToken) {
                                await fetch("https://exp.host/--/api/v2/push/send", {
                                    method: "POST",
                                    headers: {
                                        "Accept": "application/json",
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        to: userData.pushToken,
                                        sound: "default",
                                        title: "Challenge Expired",
                                        body: `Your challenge "${challenge.description}" has expired.`,
                                        data: {
                                            type: "challengeExpired",
                                            challengeId: id
                                        }
                                    })
                                });
                            }
                        }
                    }
                }
            }

            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActiveChallenges(list);
        });

        return () => stopListening();
    }, [username]);

    useEffect(() => {   // Retrieving challenge invites.
        if (!username) return;

        const invitesQuery = query(
            collection(db, "challenges"),
            where("invited", "array-contains", username),
            where("status", "==", "pending")
        );

        const stopListening = onSnapshot(invitesQuery, snapshot => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInvites(list);
        });

        return () => stopListening();
    }, [username]);

    useEffect(() => {   // Retrieving expired or cancelled challenges from firestore.
        if (!username) return;

        const expiredQuery = query(
            collection(db, "challenges"),
            where("participants", "array-contains", username),
            where("status", "in", ["expired", "cancelled"]),
            orderBy("endDate", "desc")
        );

        const stopListening = onSnapshot(expiredQuery, snapshot => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setExpiredChallenges(list);
        });

        return () => stopListening();
    }, [username]);

    useEffect(() => {   // Retrieving completed challenges from firestore.
        if (!username) return;

        const completedQuery = query(
            collection(db, "challenges"),
            where("participants", "array-contains", username),
            where("status", "==", "completed"),
            orderBy("endDate", "desc")
        );

        const stopListening = onSnapshot(completedQuery, snapshot => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCompletedChallenges(list);
        });

        return () => stopListening();
    }, [username]);

    const removeChallenge = async (id) => {
        Alert.alert(
            "Remove Challenge",
            "Are you sure you want to remove this challenge?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "challenges", id));
                        } catch (e) {
                            console.error("Error removing challenge:", e);
                            Alert.alert("Error", "Failed to remove challenge.");
                        }
                    }
                }
            ]
        );
    };

    const cancelChallenge = async (challenge) => {
        Alert.alert(
            "Cancel Challenge",
            "Are you sure you want to cancel this challenge?",
            [
                { text: "Close", style: "cancel" },
                {
                    text: "Yes, cancel Challenge",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const challengeRef = doc(db, "challenges", challenge.id);

                            await updateDoc(challengeRef, {
                                status: "cancelled",
                                cancelledBy: username,
                                lastUpdated: new Date()
                            });

                        } catch (e) {
                            console.error("Error cancelling challenge:", e);
                            Alert.alert("Error", "Failed to cancel challenge.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style = {{ flex: 1 }}>

            <ScrollView contentContainerStyle = {{ paddingBottom: 20 }}>

                <View style = { styles.spacer }/>

                <View style = { styles.card }>

                    <ThemedText type = "subtitle" padding = "10" >Challenge Invites</ThemedText>

                    { invites.length === 0 ? (
                        <Text style = { styles.placeholderText } > No pending invites </Text>
                    ) : (
                        invites.map((invite) => (
                            <ChallengeInviteCard key = { invite.id } invite = { invite } username = { username } />
                        ))
                    )}

                </View>

                <View style = { styles.card }>

                    <ThemedText type = "subtitle" padding = "10" >Active Challenges</ThemedText>

                    { activeChallenges.length === 0 ? (
                        <Text style = { styles.placeholderText } > No active challenges </Text>
                    ) : (
                        activeChallenges.map((challenge) => (
                            <ChallengeCard
                                key = { challenge.id }
                                challenge = { challenge }
                                removeChallenge = { removeChallenge }
                                cancelChallenge = { cancelChallenge }
                                setViewChallenge = { setViewChallenge }
                                username = { username }
                            />
                        ))
                    )}

                </View>

                <View style = { styles.card }>

                    <ThemedText type="subtitle" padding="10"> Completed Challenges </ThemedText>

                    { completedChallenges.length === 0 ? (
                        <Text style = { styles.placeholderText }> No completed challenges </Text>
                    ) : (
                        completedChallenges.map(challenge => (
                            <ChallengeCard
                                key = { challenge.id }
                                challenge = { challenge }
                                removeChallenge = { removeChallenge }
                                cancelChallenge = { cancelChallenge }
                                setViewChallenge = { setViewChallenge }
                                username = { username }
                            />
                        ))
                    )}

                </View>

                <View style = { styles.card }>

                    <ThemedText type="subtitle" padding="10"> Expired / Cancelled Challenges </ThemedText>

                    { expiredChallenges.length === 0 ? (
                        <Text style = { styles.placeholderText }> No expired or cancelled challenges </Text>
                    ) : (
                        expiredChallenges.map(challenge => (
                            <ChallengeCard
                                key = { challenge.id }
                                challenge = {challenge }
                                removeChallenge = { removeChallenge }
                                cancelChallenge = { cancelChallenge }
                                setViewChallenge = { setViewChallenge }
                                username = { username }
                            />
                        ))
                    )}

                </View>

            </ScrollView>

            <TouchableOpacity
                style = { styles.createChallengeButton }
                onPress = { () => setShowCreateModal(true) }
            >
                <Text style = { styles.friendButtonText }>Create Challenge</Text>
            </TouchableOpacity>

            { showCreateModal && (
                <CreateChallengeModal
                    onClose = { () => setShowCreateModal(false) }
                    friends = { friends }
                />
            )}

            { viewChallenge && (
                <ViewChallengeModal
                    challenge = { viewChallenge }
                    onClose = { () => setViewChallenge(null) }
                />
            )}

        </View>
    );
}

function ChallengeInviteCard({ invite, username }) {

    const getInviteTitle = (invite) => {
       switch (invite.type) {
           case "points":
               return "Points Challenge";

           case "muscle":
               // Capitalise each word of the muscle name.
               const muscleName = invite.selectedMuscle
                   .replace(/_/g, " ")
                   .replace(/\b\w/g, c => c.toUpperCase());
               return `${muscleName} Challenge`;

           case "group":
               // i.e. "Pull Exercises Challenge".
               return `${invite.muscleGroup.charAt(0).toUpperCase()
                   + invite.muscleGroup.slice(1)} Exercises Challenge`;

           case "sessions":
               return "Session Challenge";

           default:
               return "Challenge";
       }
    };

    const acceptChallengeClicked = async () => {

        const result = await acceptChallenge(invite.id, username);

        if(result.success) {
            Alert.alert("Challenge request accepted.");
        } else {
            Alert.alert("Error", "Failed to accept challenge request.");
        }
    }

    const denyChallengeClicked = async () => {

        Alert.alert(
            "Decline Challenge Invite",
            "Are you sure you want to decline this challenge invite?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Decline invite",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await denyChallenge(invite.id, username);
                        } catch (e) {
                            console.error("Error declining challenge invite:", e);
                            Alert.alert("Error", "Failed to decline challenge invite.");
                        }
                    }
                }
            ]
        );
    }

    return (
        <View style = { styles.requestBox }>

            <Text style ={ styles.friendName }>{ getInviteTitle(invite) }</Text>
            <Text>Description: { invite?.description ?? "Placeholder challenge" }</Text>
            <Text>From: { invite?.ownerUsername ?? "Unknown" }</Text>

            <View style = { styles.buttonRow }>

                <View style = { styles.buttonWrapper }>
                    <TouchableOpacity
                        style = { styles.acceptButton }
                        onPress = { acceptChallengeClicked }
                    >
                        <Text style = { styles.friendButtonText }>ACCEPT</Text>
                    </TouchableOpacity>
                </View>

                <View style = { styles.buttonWrapper }>
                    <TouchableOpacity
                        style = { styles.denyButton }
                        onPress = { denyChallengeClicked }
                    >
                        <Text style = { styles.friendButtonText }>DENY</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </View>
    );
}

function ChallengeCard({ challenge, setViewChallenge, removeChallenge, cancelChallenge, username }) {
   const progress = challenge.progress || {};

   const getChallengeTitle = (challenge) => {

       const isGroup = challenge.mode === "group";

       let baseTitle = "";

       switch (challenge.type) {
           case "points":
               baseTitle = "Points Challenge";
               break;

           case "muscle":
               const muscleName = challenge.selectedMuscle
                   .replace(/_/g, " ")
                   .replace(/\b\w/g, c => c.toUpperCase());
               baseTitle = `${muscleName} Challenge`;
               break;

           case "group":
               baseTitle =
                   `${challenge.muscleGroup.charAt(0).toUpperCase() + challenge.muscleGroup.slice(1)} Exercises Challenge`;
               break;

           case "sessions":
               baseTitle = "Session Challenge";
               break;

           default:
               baseTitle = "Challenge";
       }

       return isGroup ? `Group ${baseTitle}` : baseTitle;

   };

   const getTimeRemaining = (endDate) => {
       if (!endDate) return "";

       const now = new Date();
       const end = endDate.toDate();
       const diff = end.getTime() - now.getTime();

       if (diff <= 0) return "Expired";

       const minutes = Math.floor(diff / (1000 * 60));
       const days = Math.floor(diff / (1000 * 60 * 60 * 24));
       const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

       if (days > 0) return `${days} day${days === 1 ? "" : "s"} remaining`;

       if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} remaining`;

       return `${minutes} minute${minutes === 1 ? "" : "s"} remaining`;

   };

   return (
       <View style = { styles.requestBox }>
           <Text style ={ styles.friendName }>{ getChallengeTitle(challenge) }</Text>

           <Text>{ challenge.description }</Text>

           { challenge.status === "active" && challenge.period !== "once" && (
               <Text style = {{ marginTop: 4 }}>
                   { getTimeRemaining(challenge.endDate) }
               </Text>
           )}

           {/* Shared progress. */}
           <Text style = {{ marginTop: 6 }}>
               { challenge.mode === "group"
                   ? `Group Progress: ${progress.shared ?? 0} / ${challenge.target}`
                   : `Progress: ${progress.shared ?? 0} / ${challenge.target}`
               }
           </Text>

           <Text style = {{
               marginTop: 4,
               color:
                   challenge.status === "active" ? "#24C3FF" :
                   challenge.status === "pending" ? "#FFA500" :
                   challenge.status === "completed" ? "green" :
                   (challenge.status === "expired" || challenge.status === "cancelled") ? "red" :
                   undefined
           }}>
               Status: { challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1) }
           </Text>

           { challenge.status === "cancelled" && challenge.cancelledBy && (
               <Text style={{ marginTop: 4, color: "red" }}>
                   Cancelled by: { challenge.cancelledBy === username ? "You" : challenge.cancelledBy }
               </Text>
           )}

           <View style = { styles.buttonRow }>

               <View style = { styles.buttonWrapper }>
                   <TouchableOpacity
                       style = { styles.viewChallengeButton }
                       onPress = { () => setViewChallenge(challenge) }
                   >
                       <Text style = { styles.friendButtonText }>View</Text>
                   </TouchableOpacity>
               </View>

               <View style = { styles.buttonWrapper }>
                   { challenge.status === "active" ? (
                       <TouchableOpacity
                           style = { styles.removeChallengeButton }
                           onPress = { () => cancelChallenge(challenge) }
                       >
                           <Text style = { styles.friendButtonText }>Cancel</Text>
                       </TouchableOpacity>
                   ) : (
                       <TouchableOpacity
                           style = { styles.removeChallengeButton }
                           onPress = { () => removeChallenge(challenge.id) }
                       >
                           <Text style = { styles.friendButtonText }>Remove</Text>
                       </TouchableOpacity>
                   )}
               </View>

           </View>
       </View>
   );
}

function CreateChallengeModal({ onClose, friends }) {

    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const loadUsername = async () => {
            const storedUser = await AsyncStorage.getItem("loggedInUser");
            setUsername(storedUser);
        };
        loadUsername();
    }, []);

    const [type, setType] = useState<'points' | 'muscle' | 'group' | 'sessions' | null>('points');
    const [target, setTarget] = useState('');
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'once' | null>(null);
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [showMuscleDropdown, setShowMuscleDropdown] = useState(false);
    const [muscleGroup, setMuscleGroup] = useState<'pull' | 'push' | 'legs' | 'core' | null>(null);
    const [friendInput, setFriendInput] = useState('');
    const [invitedFriends, setInvitedFriends] = useState<string[]>([]);

    // Full muscle list from exerciseScoring.ts.
    const muscleList = [
        "biceps", "triceps", "forearms",
        "side_delts", "rear_delts", "front_delts",
        "lats", "traps", "shoulders",
        "chest", "lower_back", "upper_back", "mid_back", "back",
        "core",
        "quads", "hamstrings", "glutes", "calves",
        "adductors", "abductors",
        "other"
    ];

    const addFriend = () => {   // For adding friends to challenges.
        const trimmed = friendInput.trim();

        if (!trimmed) return;

        // Prevent user from inviting themselves.
        if (trimmed === username) {
            Alert.alert("Error", "You cannot invite yourself to a challenge.");
            return;
        }

        // Validate friend exists in user's friend list.
        if (!friends.includes(trimmed)) {
            Alert.alert("Error", "You can only invite users you are already friends with.");
            return;
        }

        if (invitedFriends.includes(trimmed)) {
            Alert.alert("Error", "This friend is already invited.");
            return;
        }

        setInvitedFriends([...invitedFriends, trimmed]);
        setFriendInput('');
    };


    const removeFriend = (name: string) => {
        setInvitedFriends(invitedFriends.filter(f => f !== name));
    };

    const generateDescription = () => {     // Generating challenge description.
        const periodText =
            period === "daily" ? "in one day" :
            period === "weekly" ? "in a week" :
            period === "monthly" ? "in a month" :
            ""; // No text for "once".

        const suffix = periodText ? ` ${periodText}` : "";

        switch (type) {
            case "points":
                return `Earn ${target} total points${suffix}.`;

            case "muscle":
                return `Earn ${target} points for ${selectedMuscle?.replace(/_/g, " ")}${suffix}.`;

            case "group":
                return `Earn ${target} points for ${muscleGroup} exercises${suffix}.`;

            case "sessions":
                return `Complete ${target} workout session${target === "1" ? "" : "s"}${suffix}.`;

            default:
                return null;
        }
    };

    const createChallenge = async () => {
        try {
            const ownerUsername = await AsyncStorage.getItem("loggedInUser");
            if (!ownerUsername) {
                Alert.alert("Error", "No logged in user found.");
                return;
            }

            if (!target || isNaN(Number(target))) {
                Alert.alert("Error", "Please enter a valid target number.");
                return;
            }

            if (!period) {
                Alert.alert("Error", "Please select a time period.");
                return;
            }

            if (type === "muscle" && !selectedMuscle) {
                Alert.alert("Error", "Please select a muscle for this challenge.");
                return;
            }

            if (type === "group" && !muscleGroup) {
                Alert.alert("Error", "Please select a muscle group.");
                return;
            }

            // Build start and end dates.
            const startDate = Timestamp.now();
            let endDate;

            switch (period) {
                case "daily":
                    endDate = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
                    break;
                case "weekly":
                    endDate = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
                    break;
                case "monthly":
                    endDate = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
                    break;
                case "once":
                    endDate = startDate;
                    break;
            }

            // Build participants + invited.
            const participants = [ownerUsername];
            const invited = invitedFriends;

            // Determine individual or group challenge.
            const mode = invited.length > 0 ? "group" : "individual";

            // Build challenge object.
            const challengeData = {
                ownerUsername,
                type,
                mode,
                description: generateDescription(),
                target: Number(target),
                period,
                startDate,
                endDate,
                muscleGroup: type === "group" ? muscleGroup : null,
                selectedMuscle: type === "muscle" ? selectedMuscle : null,
                isChallenge: true,
                progress: { shared: 0 },
                participants,
                invited,
                status: invited.length > 0 ? "pending" : "active",
                createdAt: Timestamp.now(),
                lastUpdated: Timestamp.now(),
                completionNotified: false,
            };

            // Write to Firestore, create challenge and get id.
            const challengeRef = await addDoc(collection(db, "challenges"), challengeData);
            const challengeId = challengeRef.id;

            Alert.alert("Success", "Challenge created!");
            onClose();

            // Send push notifs to invited users.
            for (const user of invitedFriends) {
                const userQuery = query(collection(db, "users"), where("username", "==", user));
                const userDocs = await getDocs(userQuery);

                if (!userDocs.empty) {
                    const userData = userDocs.docs[0].data();

                    if (userData.pushToken) {
                        await fetch("https://exp.host/--/api/v2/push/send", {
                            method: "POST",
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                to: userData.pushToken,
                                sound: "default",
                                title: "New Challenge Invite",
                                body: `${ownerUsername} invited you to a challenge.`,
                                data: {
                                    type: "challengeInvite",
                                    challengeId: challengeId
                                }
                            })
                        });
                    }
                }
            }

        } catch (e) {
            console.error("Error creating challenge:", e);
            Alert.alert("Error", "Failed to create challenge.");
        }
    };

    return (

        <View style = { styles.modalOverlay }>

            <View style = { styles.modalContainer }>

                <TouchableOpacity style = { styles.closeButton } onPress = { onClose }>
                    <Text style = { styles.friendButtonText }>Close</Text>
                </TouchableOpacity>

                <Text style = { styles.modalTitle }>Create Challenge</Text>

                <ScrollView style = {{ maxHeight: '90%' }}>

                    {/* Type selector. */}
                    <Text style = { styles.modalLabel }>Type</Text>

                    <View style = { styles.modalButtonRow }>
                        { ['points', 'muscle', 'group', 'sessions'].map(option => (
                            <TouchableOpacity
                                key = { option }
                                style = {[
                                    styles.modalOptionButton,
                                    type === option && styles.modalOptionButtonActive
                                ]}
                                onPress = { () => setType(option as any) }
                            >
                                <Text style = { styles.modalOptionText }>
                                    { option.charAt(0).toUpperCase() + option.slice(1) }
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Explanation for selected type. */}
                    { type && (
                        <Text>
                            { type === 'points' && "Earn a general target number of total points." }
                            { type === 'muscle' && "Earn points for a specific muscle." }
                            { type === 'group' && "Earn points for a broad movement group (push, pull, legs, core)." }
                            { type === 'sessions' && "Complete a target number of workout sessions." }
                        </Text>
                    )}

                    {/* Muscle selector dropdown list (only for individual muscle challenges). */}
                    { type === 'muscle' && (
                        <>
                            <Text style = { styles.modalLabel }>Muscle</Text>

                            <TouchableOpacity
                                style = { styles.modalInput }
                                onPress = { () => setShowMuscleDropdown(!showMuscleDropdown)}
                            >
                                <Text>
                                    { selectedMuscle
                                        ? selectedMuscle.replace(/_/g, " ")
                                        : "Select a muscle"}
                                </Text>
                            </TouchableOpacity>

                            { showMuscleDropdown && (
                                <View style = { styles.modalDropdown }>
                                    { muscleList.map(muscle => (
                                        <TouchableOpacity
                                            key = { muscle }
                                            style = {[
                                                styles.modalDropdownItem,
                                                selectedMuscle === muscle && styles.modalDropdownItemActive
                                            ]}
                                            onPress = { () => {
                                                setSelectedMuscle(muscle);
                                                setShowMuscleDropdown(false);
                                            }}
                                        >
                                            <Text style = { styles.modalDropdownText }>
                                                { muscle.replace(/_/g, " ") }
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                        </>
                    )}

                    {/* Group selector (only for muscle group challenges). */}
                    { type === 'group' && (
                        <>
                            <Text style = { styles.modalLabel }>Group</Text>

                            <View style = { styles.modalButtonRow }>
                                { ['pull', 'push', 'legs', 'core'].map(option => (
                                    <TouchableOpacity
                                        key = { option }
                                        style = {[
                                            styles.modalOptionButton,
                                            muscleGroup === option && styles.modalOptionButtonActive
                                        ]}
                                        onPress = { () => setMuscleGroup(option as any) }
                                    >
                                        <Text style = { styles.modalOptionText }>
                                            { option.charAt(0).toUpperCase() + option.slice(1) }
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Target input. */}
                    <Text style = { styles.modalLabel }>Target</Text>

                    <TextInput
                        style = { styles.modalInput }
                        placeholder = "Enter target number"
                        keyboardType = "numeric"
                        value = { target }
                        onChangeText={(text) => {
                            const cleaned = text.replace(/[^0-9]/g, "");    // Stops non-integer inputs.
                            setTarget(cleaned);
                        }}
                    />

                    {/* Time period selector. */}
                    <Text style = { styles.modalLabel }>Period</Text>

                    <View style = { styles.modalButtonRow }>
                        {[
                            { key: 'daily', label: 'One Day' },
                            { key: 'weekly', label: 'A Week' },
                            { key: 'monthly', label: 'A Month' },
                            { key: 'once', label: 'One Time' }
                        ].map(option => (
                            <TouchableOpacity
                                key = { option.key }
                                style = {[
                                    styles.modalOptionButton,
                                    period === option.key && styles.modalOptionButtonActive
                                ]}
                                onPress = { () => setPeriod(option.key as any) }
                            >
                                <Text style = { styles.modalOptionText }>{ option.label }</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Invite friends input. */}
                    <Text style = { styles.modalLabel }>Invite Friends (optional)</Text>

                    <View style = {{ flexDirection: 'row', alignItems: 'center', columnGap: 10, marginBottom: 10 }}>
                        <TextInput
                            style = {[ styles.modalInput, { flex: 1 } ]}
                            placeholder = "Enter friend's username"
                            value = { friendInput }
                            onChangeText = { setFriendInput }
                        />
                        <TouchableOpacity style = { styles.addFriendButton } onPress = { addFriend }>
                            <Text style = { styles.friendButtonText }>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Invited friends list. */}
                    { invitedFriends.length > 0 && (
                        <>
                            <Text style = { styles.modalLabel }>Invited</Text>

                            { invitedFriends.map(name => (
                                <View key = { name } style = { styles.friendRow }>
                                    <Text style = { styles.friendName }>{ name }</Text>

                                    <TouchableOpacity
                                        style = { styles.removeButton }
                                        onPress = { () => removeFriend(name) }
                                    >
                                        <Text style = { styles.friendButtonText }>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </>
                    )}

                </ScrollView>

                <TouchableOpacity
                    style = { styles.createChallengeButton2 }
                    onPress = { createChallenge }
                >
                    <Text style = { styles.friendButtonText }>Create</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}

function ViewChallengeModal({ challenge, onClose }) {

    const muscleName = challenge.selectedMuscle
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    const groupName = challenge.muscleGroup
        ? challenge.muscleGroup.charAt(0).toUpperCase() + challenge.muscleGroup.slice(1)
        : null;

    return (

        <View style = { styles.modalOverlay }>

            <View style = { styles.modalContainer }>

                <TouchableOpacity style = { styles.closeButton } onPress = { onClose }>
                    <Text style = { styles.friendButtonText }>Back</Text>
                </TouchableOpacity>

                <Text style = { styles.modalTitle }>Challenge Details</Text>

                <ScrollView style = {{ maxHeight: '90%' }}>

                    <Text style = { styles.modalLabel }>Type</Text>
                    <Text style = { styles.modalValue }>
                        { challenge.type === 'points' && "Points" }
                        { challenge.type === 'muscle' && muscleName }
                        { challenge.type === 'group' && `${groupName} Exercises` }
                        { challenge.type === 'sessions' && "Sessions" }
                    </Text>

                    <Text style = { styles.modalLabel }>Description</Text>
                    <Text style = { styles.modalValue }>{ challenge.description }</Text>

                    <Text style = { styles.modalLabel }>Target</Text>
                    <Text style = { styles.modalValue }>{ challenge.target }</Text>

                    <Text style = { styles.modalLabel }>Period</Text>
                    <Text style = { styles.modalValue }>{ challenge.period }</Text>

                    <Text style = { styles.modalLabel }>Participants</Text>
                    { challenge.participants.map(name => (
                        <Text key = { name } style = { styles.modalValue }>{ name }</Text>
                    ))}

                    { challenge.invited?.length > 0 && (
                        <>
                            <Text style = { styles.modalLabel }>Invited</Text>
                            { challenge.invited.map(name => (
                                <Text key = { name } style = { styles.modalValue }>{ name }</Text>
                            ))}
                        </>
                    )}

                </ScrollView>

            </View>

        </View>
    );
}

function FriendsContent() {     // Loads username and listens for incoming friend requests.

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

        const requestsQuery = query( // Listen for incoming requests.
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

        const userQuery = query( // Listen for friend list change.
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
                                        <Text style = { styles.friendButtonText }>ACCEPT</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style = { styles.buttonWrapper }>
                                    <TouchableOpacity style = { styles.denyButton } onPress = { () => denyClicked(item.id) }>
                                        <Text style = { styles.friendButtonText }>DENY</Text>
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
        height: '15%',
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
        top: 46,
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
        top: 46,
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
    createChallengeButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        margin: 16,
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
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '95%',
        maxHeight: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        position: 'relative',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 6,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        backgroundColor: 'white',

    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    modalOptionButton: {
        flex: 1,
        paddingVertical: 8,
        marginHorizontal: 4,
        backgroundColor: '#D9D9D9',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOptionButtonActive: {
        backgroundColor: '#52ABFF',
    },
    modalOptionText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    closeButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: 'red',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
    },
    createChallengeButton2: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginTop: 14,
        backgroundColor: '#52ABFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        alignItems: 'center',
    },
    modalDropdown: {
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 8,
        marginTop: 5,
        backgroundColor: 'white',
    },
    modalDropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalDropdownItemActive: {
        backgroundColor: '#E6F3FF',
    },
    modalDropdownText: {
        fontSize: 16,
    },
    addFriendButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'green',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewChallengeButton: {
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
    removeChallengeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#E25252',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        alignItems: 'center',
    },
});

