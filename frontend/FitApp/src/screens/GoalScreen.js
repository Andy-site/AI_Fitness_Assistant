import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const GoalScreen = ({ navigation, route }) => {
    const [goal, setGoal] = useState(route.params?.goal || '');
    const [isFocus, setIsFocus] = useState(false);

    const handleNext = () => {
        navigation.navigate('RegisterScreen', { ...route.params, goal });
    };

    return (
        <View style={styles.container}>
            <Dropdown
                data={[
                    { label: 'Weight Loss', value: 'Weight Loss' },
                    { label: 'Weight Gain', value: 'Weight Gain' },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select Goal"
                value={goal}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => setGoal(item.value)}
                style={[
                    styles.dropdown,
                    isFocus && { borderColor: 'blue' },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
            />
            <Button title="Finish Registration" onPress={handleNext} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    dropdown: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 20,
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#ccc',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#000',
    },
});

export default GoalScreen;
