import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { addTestUser } from '../../src/firestore';

export default function FirebaseTestScreen() {
    useEffect(() => {
        console.log('useEffect running!');
        addTestUser();
    }, []);

    return (
        <View style = {{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white',}}>

            <Text style = {{ color: 'black'}}> Firestore test running! </Text>
        </View>
    );

}