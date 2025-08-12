import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Appbar,
  Searchbar,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { learningAPI } from '../services/api';

type LearningScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PackDetail'
>;

interface FlashcardPack {
  id: number;
  title: string;
  description: string | null;
  flashcard_count: number;
}

const LearningScreen = () => {
  const navigation = useNavigation<LearningScreenNavigationProp>();
  const [packs, setPacks] = useState<FlashcardPack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newPackTitle, setNewPackTitle] = useState('');
  const [newPackDescription, setNewPackDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadPacks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await learningAPI.getPacks(); 
      setPacks(data);
    } catch (error) {
      console.error('Failed to load learning packs:', error);
      Alert.alert('Error', 'Failed to load learning packs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPacks();
    }, [loadPacks])
  );

  const filteredPacks = useMemo(() => {
    if (!searchQuery) {
      return packs;
    }
    return packs.filter(pack =>
      pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pack.description && pack.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, packs]);

  const handleCreatePack = async () => {
    if (!newPackTitle.trim()) {
      Alert.alert('Validation Error', 'Title is required.');
      return;
    }
    try {
      setIsCreating(true);
      await learningAPI.createPack(newPackTitle, newPackDescription);
      setModalVisible(false);
      setNewPackTitle('');
      setNewPackDescription('');
      await loadPacks();
    } catch (error) {
      console.error('Failed to create pack:', error);
      Alert.alert('Error', 'Failed to create the new pack.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePressPack = (packId: number) => {
    navigation.navigate('PackDetail', { packId });
  };

  const renderPack = ({ item }: { item: FlashcardPack }) => (
    <Card style={styles.packCard} onPress={() => handlePressPack(item.id)}>
      <Card.Content>
        <Title style={styles.packTitle}>{item.title}</Title>
        {item.description && (
          <Paragraph style={styles.packDescription}>{item.description}</Paragraph>
        )}
        <View style={styles.packFooter}>
          <Text style={styles.packInfo}>{item.flashcard_count} cards</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Learning Packs" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredPacks}
          renderItem={renderPack}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadPacks}
          ListHeaderComponent={
            <Searchbar
              placeholder="Search packs..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="chat-plus"
        onPress={() => setModalVisible(true)}
      />
      
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Title>Create New Pack</Title>
          <TextInput
            label="Title"
            value={newPackTitle}
            onChangeText={setNewPackTitle}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Description (Optional)"
            value={newPackDescription}
            onChangeText={setNewPackDescription}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
          <Button 
            mode="contained" 
            onPress={handleCreatePack} 
            loading={isCreating}
            disabled={isCreating}
            style={styles.button}
          >
            Create
          </Button>
          <Button 
            onPress={() => setModalVisible(false)} 
            disabled={isCreating}
            style={styles.button}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for FAB
  },
  searchbar: {
    marginTop: 16,
    marginBottom: 16,
  },
  packCard: {
    marginBottom: 12,
  },
  packTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packDescription: {
    marginBottom: 12,
    color: '#6b7280',
  },
  packFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  packInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  }
});

export default LearningScreen;
