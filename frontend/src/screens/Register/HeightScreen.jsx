import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import InputField from '../../components/InputField';
import NextButton from '../../components/NextButton';

const HeightScreen = ({ navigation, route }) => {
    const [height, setHeight] = useState(route.params?.height || '');

    const handleNext = () => {
        // Parse the height as a float before navigating to the next screen
        const parsedHeight = parseFloat(height);
        if (!isNaN(parsedHeight) && parsedHeight > 0) {
            navigation.navigate('WeightScreen', { ...route.params, height: parsedHeight });
        } else {
            alert("Please enter a valid height (e.g., 5.9)");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Height</Text>
            <View style={styles.purpleBackground}>
                <Text style={styles.label}>Enter your Height</Text>
                <InputField
                    placeholder="Height (e.g., 5.9)"
                    style={styles.input}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                />
            </View>
            <NextButton title="Next" onPress={handleNext} style={{ marginLeft: '-5' }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000', // Black background
        // padding: 20,
    },
    purpleBackground: {
        backgroundColor: '#B3A0FF', // Purple container background
        width: '100%',
        padding: 20,
        // borderRadius: 15,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#232323',
        fontWeight: '500',
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 50,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 45,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingLeft: 10,
        fontSize: 16,
        color: '#232323',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
});

export default HeightScreen;
