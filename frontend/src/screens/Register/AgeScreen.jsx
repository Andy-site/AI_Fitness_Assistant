import React, { useState } from 'react';
import { View, StyleSheet,Text } from 'react-native';
import InputField from '../../components/InputField';
import NextButton from '../../components/NextButton';

const AgeScreen = ({ navigation, route }) => {
    const [age, setAge] = useState(route.params?.age || '');

    const handleNext = () => {
        const parsedAge = parseInt(age, 10); // Parse age as an integer
        if (!isNaN(parsedAge) && parsedAge > 0) {
            navigation.navigate('HeightScreen', { ...route.params, age: parsedAge });
        } else {
            alert("Please enter a valid age (e.g., 22)");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Age</Text>
            <View style={styles.purpleBackground}>
                <Text style={styles.label}>Enter you Age</Text>
                
                <InputField
                    placeholder="Age"
                    style={styles.input}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                />
            </View>
            <NextButton title="Next" onPress={handleNext} style={{marginLeft:'-5'}}/>
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
   
});

export default AgeScreen;
