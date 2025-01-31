// Home.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const Home = ({navigation}) => {
  return (
    <View style={styles.outcontainer}>
      <Header title="Home" showBackButton={false} />
      <View style={styles.container}>
        {/* Greeting */}
        <Text style={styles.greeting}>Hi Ananda!!! </Text>
        <Text style={styles.greeting2}>Personal Health Assistant</Text>

        {/* Icon Row */}
        <View style={styles.iconRow}>
          {/* Button 1 */}
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={require('../../assets/Images/Vector.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>People</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Button 2 */}
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={require('../../assets/Images/Progress.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>Progress</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Button 3 */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Workout')}>
            <Image
              source={require('../../assets/Images/Dumbell.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>Workout</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Button 4 */}
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={require('../../assets/Images/icon3(1).png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>Nutrition</Text>
          </TouchableOpacity>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {/* Recommendation Cards */}
        <View style={styles.cardContainer}>
          <ImageBackground
            source={require('../../assets/Images/Girl1.png')}
            style={styles.card}
            imageStyle={styles.cardImage}
          />
          <ImageBackground
            source={require('../../assets/Images/Girl2.png')}
            style={styles.card}
            imageStyle={styles.cardImage}
          />
        </View>

        {/* Weekly Challenge */}
        <View style={styles.weeklyChallenge}>
          <Text style={styles.challengeTitle}>Weekly Challenge</Text>
          <Text style={styles.challengeText}>Plank With Hip Twist</Text>
        </View>

        {/* Articles & Tips */}
        <Text style={styles.articlesTips}>Articles & Tips</Text>

        {/* Footer */}
      </View>
      <Footer /> {/* Using the Footer component here */}
    </View>
  );
};

const styles = StyleSheet.create({
  outcontainer: {
    flex: 1,
    backgroundColor: '#212020',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
  },

  greeting: {
    marginTop: 100,
    fontSize: 20,
    fontWeight: '700',
    color: '#896CFE',
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  greeting2: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#896CFE',
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  subtext: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  recommendationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E2F163',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 40,
    width: '90%',
  },
  iconButton: {
    alignItems: 'center',
  },
  iconImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  separator: {
    width: 1,
    height: 50,
    backgroundColor: '#896CFE',
    marginHorizontal: 10,
  },
  iconText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  card: {
    width: 157,
    height: 138,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    resizeMode: 'cover',
  },
  weeklyChallenge: {
    width: '90%',
    height: 125,
    backgroundColor: '#212020',
    borderRadius: 20,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2F163',
  },
  challengeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 10,
  },
  articlesTips: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E2F163',
    marginTop: 30,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
});

export default Home;
