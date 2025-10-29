import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { addUser } from '../../src/firestoreTest';

export default function FirebaseTestScreen() {
    useEffect(() => {
        console.log('useEffect running!');
        addUser();
    }, []);

    return (
        <View style = {{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text> Firestore test running! </Text>
        </View>
    );

}