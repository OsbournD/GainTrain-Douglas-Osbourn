import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, TextInput, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../../src/firestore';
import { useIsFocused } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

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

    return(

        <View style={ styles.appBackground }>

            <ThemedView style={styles.headerContainer}>

                    <TouchableOpacity style = { styles.backButton } onPress = { backToDashboardClicked } >
                        <Text style = { styles.headerButtonText }> BACK </Text>
                    </TouchableOpacity>

                    <ThemedText style = { styles.titleText }>Community</ThemedText>

                    <TouchableOpacity style = { styles.headerButton } onPress = { () => console.log("Settings button clicked")} >
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
    return (
        <View style = { styles.card }>
            <ThemedText style = { styles.welcomeText }>Friends</ThemedText>
        </View>
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
});

