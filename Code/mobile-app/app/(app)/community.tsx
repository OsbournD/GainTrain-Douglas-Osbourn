import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
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
    return (
        <View style = { styles.card }>
            <ThemedText style = { styles.welcomeText }>Feed</ThemedText>
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
        height: 140,
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
        fontSize: 25,
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
});

