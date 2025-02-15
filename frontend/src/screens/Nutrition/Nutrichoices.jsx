import { View, Text, StyleSheet , Button} from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'


const Nutrichoices = () => {
    const navigation = useNavigation();

    const handleNext = () => 
        navigation.navigate('LandNutri');
    

  

  return (
    <View>
      <Button style={styles.button}
        title="Know Your Meal Plans"
        onPress={handleNext}
        />
    </View>
  )
}

const styles = StyleSheet.create({
    button: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: 10,
      margin: 10,
      width: 200,
      borderRadius: 10,
    },
})

export default Nutrichoices