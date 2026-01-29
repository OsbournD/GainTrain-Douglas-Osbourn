import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../src/firebase";

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
    const [sessionLocation, setSessionLocation] = useState("");

    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
    const [templateList, setTemplateList] = useState([
        "Push Day",
        "Pull Day",
        "Legs",
        "Full Body",
    ]);
    const [selectedTemplate, setSelectedTemplate] = useState("");

    const [showSetup, setShowSetup] = useState(true);

    const [exercises, setExercises] = useState([]);
    const [showExerciseSelector, setShowExerciseSelector] = useState(false);
    const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);

    const [exerciseLibrary, setExerciseLibrary] = useState([]);
    const [loadingExercises, setLoadingExercises] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [newExerciseName, setNewExerciseName] = useState("");
    const [newDifficulty, setNewDifficulty] = useState("");
    const [newTags, setNewTags] = useState("");
    const [newPrimaryMuscle, setNewPrimaryMuscle] = useState("");
    const [newSecondaryMuscles, setNewSecondaryMuscles] = useState("");
    const [newBestFor, setNewBestFor] = useState("");

    const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
    const [showSetModal, setShowSetModal] = useState(false);
    const [newSetWeight, setNewSetWeight] = useState("");
    const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
    const [newSetReps, setNewSetReps] = useState("");
    const [newSetRPE, setNewSetRPE] = useState("");
    const [newSetEquipment, setNewSetEquipment] = useState("");
    const [newSetModifiers, setNewSetModifiers] = useState("");

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

        const fetchUserPreferences = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('loggedInUser');
                if (!storedUser) return;

                const username = storedUser;

                const usersQuery = query(
                    collection(db, "users"),
                    where("username", "==", username)
                );

                const snapshot = await getDocs(usersQuery);

                if (!snapshot.empty) {
                    const userData = snapshot.docs[0].data();
                    if (userData.weightUnitPreference) {
                        setWeightUnit(userData.weightUnitPreference);
                    }
                }
            } catch (e) {
                console.error("Error fetching user preferences:", e);
            }
        };

        fetchUserPreferences();

        const fetchExercises = async () => {
            try {
                const exercisesQuery = query(
                    collection(db, "exercises")
                );

                const querySnapshot = await getDocs(exercisesQuery);

                const list = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setExerciseLibrary(list);

            } catch (e) {
                console.error("Error fetching exercises: ", e);
            }
            setLoadingExercises(false);
        }

        fetchExercises();

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

                { showSetup && (

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
                            style = { styles.input }
                            placeholder = "Location (optional)"
                            value = { sessionLocation }
                            onChangeText = { setSessionLocation }
                        />

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
                                    { selectedTemplate || "Choose Template (optional)..." }
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                )}

                <TouchableOpacity style = { styles.hideButton }
                    onPress = {() => {
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

                    { exercises.length === 0 && (
                        <Text style = { styles.setText }>No exercises added yet.</Text>
                    )}

                    { exercises.map((exercise, index) => (

                        <View key = { index } style = { styles.exerciseCard }>

                            <Text style = { styles.exerciseTitle }>{ exercise.name }</Text>

                            { exercise.sets && exercise.sets.length > 0 && exercise.sets.map((set, setIndex) => (
                                <View key = { setIndex } style = {{ marginTop: 4 }}>

                                    <Text style = { styles.setText }>
                                        { set.weight }{ weightUnit } x { set.reps }
                                        { set.rpe ? ` — RPE ${set.rpe}` : "" }
                                    </Text>

                                    { set.equipment && set.equipment.length > 0 && (
                                        <Text style = { styles.setText }>
                                            Equipment: { set.equipment.join(', ') }
                                        </Text>
                                    )}

                                    { set.modifiers && set.modifiers.length > 0 && (
                                        <Text style = { styles.setText }>
                                            Modifiers: { set.modifiers.join(', ') }
                                        </Text>
                                    )}

                                    <TouchableOpacity
                                        style = {{ marginLeft: 10, marginTop: 2 }}
                                        onPress = { () => {
                                            const updatedExercises = [...exercises];
                                            updatedExercises[index].sets = updatedExercises[index].sets.filter((_, i) => i !== setIndex);
                                            setExercises(updatedExercises);
                                        }}
                                    >
                                        <Text style = {{ color: '#E25252', fontWeight: 'bold' }}>Remove Set</Text>
                                    </TouchableOpacity>

                                    { setIndex < exercise.sets.length - 1 && (
                                        <View style = {{
                                            height: 1,
                                            backgroundColor: '#D9D9D9',
                                            marginVertical: 6,
                                            marginHorizontal: 10,
                                        }} />
                                    )}

                                </View>
                            ))}

                            <View style = { styles.buttonRow }>

                                <TouchableOpacity
                                    style = { styles.addButton }
                                    onPress = { () => {
                                        setActiveExerciseIndex(index);
                                        setNewSetWeight("");
                                        setNewSetReps("");
                                        setNewSetRPE("");
                                        setNewSetEquipment("");
                                        setNewSetModifiers("");
                                        setShowSetModal(true)
                                    }}
                                >
                                    <Text style = { styles.exerciseButtonText }>+ Add Set</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style = { styles.editButton }>
                                    <Text style = { styles.exerciseButtonText }>Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style = { styles.removeButton }
                                    onPress = { () => {
                                        setExercises(exercises.filter((_, i) => i !== index));
                                    }}
                                >
                                    <Text style = { styles.exerciseButtonText }>Remove</Text>
                                </TouchableOpacity>

                            </View>

                        </View>

                    ))}

                    <TouchableOpacity
                        style = { styles.addExerciseButton }
                        onPress = { () => setShowExerciseSelector(true) }
                    >
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

            { showTemplateDropdown && (
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

            { showExerciseSelector && (
                <View style = { styles.modalOverlay }>

                    <View style = { styles.modalCard }>

                        <Text style = { styles.headingText }>Add Exercise</Text>

                        <TextInput
                            style = { styles.input }
                            placeholder = "Search exercises..."
                            value = { searchQuery }
                            onChangeText = { setSearchQuery }
                        />

                        <ScrollView style = {{ maxHeight: 200 }}>

                            { exerciseLibrary
                                .filter(exercise => exercise.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((exercise, index) => (
                                    <TouchableOpacity
                                        key = { index }
                                        style = { styles.dropdownItem }
                                        onPress = { () => {
                                            const exerciseInstance = {
                                                ... exercise,
                                                sets: []
                                            };
                                            setExercises([...exercises, exerciseInstance]);
                                            setShowExerciseSelector(false);
                                        }}
                                    >

                                        <Text style = { styles.dropdownItemText }>{ exercise.name }</Text>
                                    </TouchableOpacity>

                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style = { styles.addExerciseButton }
                            onPress = { () => {
                                setShowExerciseSelector(false);
                                setShowNewExerciseModal(true);
                            }}
                        >
                            <Text style = { styles.buttonText }>+ Create New Exercise</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style = { styles.cancelButton }
                            onPress = { () => {
                                setShowExerciseSelector(false);
                            }}
                        >
                            <Text style = { styles.buttonText }>Cancel</Text>
                        </TouchableOpacity>


                    </View>

                </View>

            )}

            { showNewExerciseModal && (
                <View style = { styles.modalOverlay }>

                    <View style = { styles.modalCard }>

                        <Text style = { styles.headingText }>New Exercise</Text>

                        <TextInput
                            style = { styles.input }
                            placeholder = "Exercise Name"
                            value = { newExerciseName }
                            onChangeText = { setNewExerciseName }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Difficulty (1-5)"
                            keyboardType = "numeric"
                            value = { newDifficulty }
                            onChangeText = { setNewDifficulty }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Tags (comma separated)"
                            value = { newTags }
                            onChangeText = { setNewTags }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Primary Muscle"
                            value = { newPrimaryMuscle }
                            onChangeText = { setNewPrimaryMuscle }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Secondary Muscles (comma separated)"
                            value = { newSecondaryMuscles }
                            onChangeText = { setNewSecondaryMuscles }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Best For (comma separated)"
                            value = { newBestFor }
                            onChangeText = { setNewBestFor }
                        />

                        <TouchableOpacity
                            style = { styles.saveExerciseButton }
                            onPress = { () => {

                                const difficultyValue = Math.max(1, Math.min(5, Number(newDifficulty)));

                                const formattedTags = newTags
                                    .split(',')
                                    .map(t => t.trim().toLowerCase().replace(/\s+/g, '_'));

                                const formattedSecondary = newSecondaryMuscles
                                    .split(',')
                                    .map(t => t.trim().toLowerCase().replace(/\s+/g, '_'));

                                const formattedBestFor = newBestFor
                                    .split(',')
                                    .map(t => t.trim().toLowerCase().replace(/\s+/g, '_'));

                                const newExercise = {
                                    name: newExerciseName,
                                    difficulty: difficultyValue,
                                    tags: formattedTags,
                                    primaryMuscle: newPrimaryMuscle.toLowerCase().replace(/\s+/g, '_'),
                                    secondaryMuscles: formattedSecondary,
                                    bestFor: formattedBestFor,
                                    createdBy: "user",
                                    createdAt: new Date(),
                                };

                                const exerciseInstance = {
                                    ... newExercise,
                                    sets: []
                                };
                                setExercises([...exercises, exerciseInstance]);
                                setShowNewExerciseModal(false);
                            }}
                        >
                            <Text style = { styles.buttonText }>Save Exercise</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style = { styles.cancelButton }
                            onPress = { () => {
                                setShowNewExerciseModal(false);
                            }}
                        >
                            <Text style = { styles.buttonText }>Cancel</Text>
                        </TouchableOpacity>

                    </View>

                </View>
            )}

            { showSetModal && activeExerciseIndex !== null && (
                <View style = { styles.modalOverlay }>

                    <View style = { styles.modalCard }>

                        <Text style = { styles.headingText }>Add Set</Text>

                        <TextInput
                            style = { styles.input }
                            placeholder = { `Weight (${weightUnit})` }
                            keyboardType = "numeric"
                            value = { newSetWeight }
                            onChangeText = { setNewSetWeight }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Reps"
                            keyboardType = "numeric"
                            value = { newSetReps }
                            onChangeText = { setNewSetReps }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "RPE (1-10)"
                            keyboardType = "numeric"
                            value = { newSetRPE }
                            onChangeText = { setNewSetRPE }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Equipment (comma separated)"
                            value = { newSetEquipment }
                            onChangeText = { setNewSetEquipment }
                        />

                        <TextInput
                            style = { styles.input }
                            placeholder = "Modifiers (comma separated)"
                            value = { newSetModifiers }
                            onChangeText = { setNewSetModifiers }
                        />

                        <TouchableOpacity
                            style = { styles.saveExerciseButton }
                            onPress = { () => {

                                const numericWeight = parseFloat(newSetWeight.replace(/[^0-9.]/g, ''));
                                const numericReps = parseInt(newSetReps.replace(/[^0-9.]/g, ''), 10);
                                const numericRPEraw = parseInt(newSetRPE.replace(/[^0-9]/g, ''), 10);
                                const numericRPE =
                                    isNaN(numericRPEraw)
                                        ? null
                                        : Math.max(1, Math.min(10, numericRPEraw));


                                const setObject = {
                                    weight: isNaN(numericWeight) ? 0 : numericWeight,
                                    reps: isNaN(numericReps) ? 0 : numericReps,
                                    rpe: numericRPE,
                                    equipment: newSetEquipment
                                        ? newSetEquipment.split(',').map(e => e.trim()).filter(Boolean)
                                        : [],
                                    modifiers: newSetModifiers
                                        ? newSetModifiers.split(',').map(m => m.trim()).filter(Boolean)
                                        : [],
                                };

                                const updatedExercises = [...exercises];
                                const target = updatedExercises[activeExerciseIndex];

                                const existingSets = target.sets || [];
                                target.sets = [...existingSets, setObject];

                                setExercises(updatedExercises);
                                setShowSetModal(false);
                                setActiveExerciseIndex(null);
                            }}
                        >
                            <Text style = { styles.buttonText }>Save Set</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style = { styles.cancelButton }
                            onPress = { () => {
                                setShowSetModal(false);
                                setActiveExerciseIndex(null);
                            }}
                        >
                            <Text style = { styles.buttonText }>Cancel</Text>
                        </TouchableOpacity>

                    </View>

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
    saveExerciseButton: {
        backgroundColor: '#58C86D',
        paddingVertical: 6,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#E25252',
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
        top: 500,
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

    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    modalCard: {
        backgroundColor: 'white',
        width: '85%',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },

});