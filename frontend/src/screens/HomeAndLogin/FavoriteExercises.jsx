import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { getFavoriteExercises, removeFromFavorites } from '../../api/fithubApi';
import { capitalizeWords } from '../../utils/StringUtils';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const FavoriteExercises = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFavoriteExercises();
      setFavorites(data || []); // Ensure data is an array
      setError(null);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      // No cleanup needed that modifies state
      return () => {};
    }, [loadFavorites])
  );

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await removeFromFavorites(favoriteId);
      setFavorites(prev => prev.filter(fav => fav.favorite_id !== favoriteId));
      showNotification('Removed from favorites');
    } catch (err) {
      console.error('Error removing favorite:', err);
      showNotification('Failed to remove favorite');
    }
  };

  const showNotification = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      setModalMessage(message);
      setIsModalVisible(true);
      setTimeout(() => setIsModalVisible(false), 2000);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.favoriteItem}>
      <View style={styles.favoriteContent}>
        <Text style={styles.exerciseName}>{capitalizeWords(item.name)}</Text>
        <Text style={styles.bodyPart}>{capitalizeWords(item.body_part)}</Text>
      </View>
      <TouchableOpacity
        style={styles.favoriteAction}
        onPress={() => handleRemoveFavorite(item.favorite_id)}
      >
        <Icon name="heart" size={24} color="#E2F163" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <ActivityIndicator size="large" color="#B3A0FF" />
        <Footer />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFavorites}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Favourites" />
      <View style={styles.innercontainer}>
        <Text style={styles.title}>Your Favorite Exercises</Text>

        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="heart-outline" size={90} color="#B3A0FF" />
            <Text style={styles.emptyText}>No favorite exercises yet</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item) => item.favorite_id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.list}
            removeClippedSubviews={false} // Prevent premature clipping
          />
        )}

        <Modal
          transparent={true}
          animationType="fade"
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalMessage}</Text>
            </View>
          </View>
        </Modal>
      </View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  innercontainer: {
    padding: 20,
    marginTop: 70,
    flex: 1, // Ensure it takes available space
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2F163',
    marginBottom: 20,
    textAlign: 'center',
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#b3a0ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B3A0FF',
  },
  favoriteContent: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bodyPart: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  favoriteAction: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#B3A0FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#212020',
    padding: 15,
    borderRadius: 8,
  },
  modalText: {
    color: '#E2F163',
    fontSize: 16,
  },
});

export default FavoriteExercises;