import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, TouchableOpacity, Text, ScrollView, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { logoutUser } from '../src/firestore';

import DateTimePicker, { useDefaultStyles, DateType } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function workoutLogger() {

    const [sessionDate, setSessionDate] = useState<DateType>();
    const defaultStyles = useDefaultStyles();
    const [sessionName, setSessionName] = useState("");
    const [sessionNotes, setSessionNotes] = useState("");

    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
    const [templateList, setTemplateList] = useState([
        "Push Day",
        "Pull Day",
        "Legs",
        "Full Body",
    ]);
    const [selectedTemplate, setSelectedTemplate] = useState("");

    const [showSetup, setShowSetup] = useState(true);

    const router = useRouter();
    const [checkingLogin, setCheckingLogin] = useState(true);

    useEffect(() => {
        const checkLogin = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            if (!storedUser) {
                router.replace('/(auth)/login');
                return;
            }
            setCheckingLogin(false);
        };
        checkLogin();
    }, []);

    if (checkingLogin) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const backToDashboardClicked = async () => {
        try {
            router.push('/(app)/dashboard');
        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    const settingsClicked = async () => {
        try {
            router.push('../../settings');
        } catch (e) {
            console.error("Navigation error: ", e);
        }

    }

    return(

        <View style={ [styles.appBackground, { position: 'relative' }] }>

            <ThemedView style = { styles.headerContainer }>

                    <TouchableOpacity style = { styles.backButton } onPress = { backToDashboardClicked } >
                        <Text style = { styles.headerButtonText }> BACK </Text>
                    </TouchableOpacity>

                    <ThemedText style = { styles.titleText }>New Workout</ThemedText>

                    <TouchableOpacity style = { styles.headerButton } onPress = { settingsClicked } >
                        <Text style = { styles.headerButtonText }> SETTINGS </Text>
                    </TouchableOpacity>

            </ThemedView>

            <View style = { styles.spacer }/>

            <View>

                {showSetup && (

                    <View style = { styles.card }>

                        <ThemedText style = { styles.headingText }>Session Setup</ThemedText>

                        <TextInput
                            style = { styles.input }
                            placeholder = "Session Name"
                            value = { sessionName }
                            onChangeText = { setSessionName }
                        />

                        <View style = { styles.input }>
                            <DateTimePicker
                                mode = "single"
                                date = { sessionDate }
                                onChange = { ({ date }) => { setSessionDate(date); console.log(date); }}
                                timePicker = { true }
                                use12Hours = { true }
                                containerHeight = {220}
                                weekdaysHeight = {20}
                                styles = {{
                                    ...defaultStyles,
                                    selected: { ...defaultStyles.selected, backgroundColor: '#24C3FF', borderRadius: 999 },
                                    selected_label: { ...defaultStyles.selected_label, color: 'white', fontWeight: 'bold' },
                                    today: { ...defaultStyles.today, borderColor: '#24C3FF', borderWidth: 1, borderRadius: 999 },
                                }}
                            />
                        </View>

                        <TextInput
                            style = { styles.notesInput }
                            placeholder = "Session Notes (optional)"
                            multiline
                            value = { sessionNotes }
                            onChangeText = { setSessionNotes }
                        />

                        <View>

                            <TouchableOpacity
                                style = { styles.input }
                                onPress = {() => setShowTemplateDropdown(!showTemplateDropdown)}
                            >
                                <Text style = {{ color: selectedTemplate ? 'black' : '#24C3FF' }}>
                                    { selectedTemplate || "Choose Template..." }
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                )}

                <TouchableOpacity style = { styles.hideButton }
                    onPress={() => {
                        setShowSetup(!showSetup);
                        setShowTemplateDropdown(false);
                    }}>
                    <Text style = { styles.collapseText }>
                        {showSetup ? '- Hide Session Setup' : '+ Show Session Setup'}
                    </Text>
                </TouchableOpacity>


            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

                <View style = { styles.card }>

                    <ThemedText style = { styles.headingText }>Exercises</ThemedText>

                    <View style = { styles.exerciseCard }>

                        <Text style = { styles.exerciseTitle }>Bench Press</Text>
                        <Text style = { styles.setText }>60kg x 8 - 3sec negative - RPE 7</Text>
                        <Text style = { styles.setText }>65kg x 6 - Wrist wraps, Pause - RPE 8</Text>

                        <View style = { styles.buttonRow }>

                            <TouchableOpacity style = { styles.addButton }>
                                <Text style = { styles.exerciseButtonText }>+ Add Set</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style = { styles.editButton }>
                                <Text style = { styles.exerciseButtonText }>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style = { styles.removeButton }>
                                <Text style = { styles.exerciseButtonText }>Remove</Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                    <View style = { styles.exerciseCard }>

                        <Text style = { styles.exerciseTitle }>Bench Press Again!</Text>
                        <Text style = { styles.setText }>60kg x 8 - 3sec negative - RPE 7</Text>
                        <Text style = { styles.setText }>65kg x 6 - Wrist wraps, Pause - RPE 8</Text>
                        <Text style = { styles.setText }>65kg x 6 - Wrist wraps, Pause - RPE 8</Text>

                        <View style = { styles.buttonRow }>

                            <TouchableOpacity style = { styles.addButton }>
                                <Text style = { styles.exerciseButtonText }>+ Add Set</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style = { styles.editButton }>
                                <Text style = { styles.exerciseButtonText }>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style = { styles.removeButton }>
                                <Text style = { styles.exerciseButtonText }>Remove</Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                    <View style = { styles.exerciseCard }>

                        <Text style = { styles.exerciseTitle }>Bench Press Again AGAIN!</Text>
                        <Text style = { styles.setText }>60kg x 8 - 3sec negative - RPE 7</Text>
                        <Text style = { styles.setText }>65kg x 6 - Wrist wraps, Pause - RPE 8</Text>
                        <Text style = { styles.setText }>65kg x 6 - Wrist wraps, Pause - RPE 8</Text>
                        <Text style = { styles.setText }>60kg x 8 - 3sec negative - RPE 7</Text>

                        <View style = { styles.buttonRow }>

                            <TouchableOpacity style = { styles.addButton }>
                                <Text style = { styles.exerciseButtonText }>+ Add Set</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style = { styles.editButton }>
                                <Text style = { styles.exerciseButtonText }>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style = { styles.removeButton }>
                                <Text style = { styles.exerciseButtonText }>Remove</Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                    <TouchableOpacity style = { styles.addExerciseButton }>
                        <Text style = { styles.buttonText }>+ Add Exercise</Text>
                    </TouchableOpacity>

                </View>

            </ScrollView>

            <View style = { styles.fixedButtonRow }>
                <TouchableOpacity style = { styles.saveButton }>
                    <Text style = { styles.buttonText }>Save Session</Text>
                </TouchableOpacity>

                <TouchableOpacity style = { styles.laterButton }>
                    <Text style = { styles.buttonText }>Finish Later</Text>
                </TouchableOpacity>

                <TouchableOpacity style = { styles.deleteButton }>
                    <Text style = { styles.buttonText }>Delete Session</Text>
                </TouchableOpacity>
            </View>

            {showTemplateDropdown && (
                <View style = { styles.dropdownMenu }>
                    {templateList.map( (template, index) => (
                        <TouchableOpacity
                            key = { index }
                            style = { styles.dropdownItem }
                            onPress = { () => {
                                setSelectedTemplate(template);
                                setShowTemplateDropdown(false);
                            }}
                        >

                            <Text style = { styles.dropdownItemText }>{template}</Text>
                        </TouchableOpacity>
                    ))}

                </View>
            )}

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
        padding: 10,
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
        fontSize: 40,
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
    input: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 6,
        marginVertical: 10,
        backgroundColor: 'white',
    },
    notesInput: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        backgroundColor: 'white',
        height: 60,
    },
    exerciseCard: {
        marginVertical: 4,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 6,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    exerciseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    setText: {
        fontSize: 14,
        marginLeft: 10,
        marginBottom: 4,
    },
    addExerciseButton: {
        backgroundColor: '#58C86D',
        paddingVertical: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    addButton: {
        backgroundColor: '#58C86D',
        flex: 1,
        padding: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 4,
    },
    editButton: {
        backgroundColor: '#46C3F3',
        flex: 1,
        padding: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 4,
    },
    removeButton: {
        backgroundColor: '#E25252',
        flex: 1,
        padding: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 4,
    },
    exerciseButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: 'green',
        paddingVertical: 20,
        flex: 1,
        borderRadius: 16,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    laterButton: {
        backgroundColor: '#46C3F3',
        paddingVertical: 20,
        flex: 1,
        borderRadius: 16,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    deleteButton: {
        backgroundColor: '#E25252',
        paddingVertical: 20,
        flex: 1,
        borderRadius: 16,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 8,
    },
    fixedButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 390,
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
    collapseText: {
        textAlign: 'center',
        color: '#24C3FF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    hideButton: {
        backgroundColor: 'white',
        padding: 2,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 20,
        marginVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 6,
    },
});