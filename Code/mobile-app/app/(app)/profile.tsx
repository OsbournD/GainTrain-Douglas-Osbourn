import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function profilePage() {

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
                <ThemedText type="title">Profile</ThemedText>
            </ThemedView>

            <View style = {{ marginTop: 10 }} padding = "20" >
                <Button title = "Back to Dashboard" onPress = { backToDashboardClicked } />
            </View>

        </View>

    );

}

const styles = StyleSheet.create({

    headerContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#94C8FF',
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

