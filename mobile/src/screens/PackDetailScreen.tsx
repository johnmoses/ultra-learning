import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Button,
  Modal,
  Portal,
  TextInput,
  ActivityIndicator,
  Text,
  IconButton,
  SegmentedButtons,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp } from '@react-navigation/native';
import DocumentPicker, { DocumentPickerResponse } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { learningAPI } from '../services/api';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  pack_id: number;
}

interface PackDetails extends FlashcardPack {
  flashcards: Flashcard[];
}

interface FlashcardPack {
  id: number;
  title: string;
  description: string | null;
}

type PackDetailRouteProp = RouteProp<{ PackDetail: { packId: number } }, 'PackDetail'>;

const PackDetailScreen = () => {
  const route = useRoute<PackDetailRouteProp>();
  const { packId } = route.params;
  const navigation = useNavigation();

  const [pack, setPack] = useState<PackDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generateMethod, setGenerateMethod] = useState('topic');
  const [topic, setTopic] = useState('');
  const [textContent, setTextContent] = useState('');
  const [document, setDocument] = useState<DocumentPickerResponse | null>(null);
  const [numCards, setNumCards] = useState('5');

  const fetchPackDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packData = await learningAPI.getPackById(packId);
      const flashcardsData = await learningAPI.getFlashcards(packId);
      setPack({ ...packData, flashcards: flashcardsData });
    } catch (e) {
      console.error('Failed to fetch pack details:', e);
      setError('Failed to load pack. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [packId]);

  useEffect(() => {
    fetchPackDetails();
  }, [fetchPackDetails]);

  const handleAddFlashcard = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      Alert.alert('Validation Error', 'Question and Answer are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      await learningAPI.createFlashcard(newQuestion, newAnswer, packId);
      setAddModalVisible(false);
      setNewQuestion('');
      setNewAnswer('');
      await fetchPackDetails();
    } catch (e) {
      console.error('Failed to add flashcard:', e);
      Alert.alert('Error', 'Could not add the flashcard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFlashcard = async () => {
    if (!editingFlashcard) return;

    try {
      setIsSubmitting(true);
      await learningAPI.updateFlashcard(editingFlashcard.id, editingFlashcard.question, editingFlashcard.answer);
      setEditModalVisible(false);
      setEditingFlashcard(null);
      await fetchPackDetails();
    } catch (e) {
      console.error('Failed to update flashcard:', e);
      Alert.alert('Error', 'Could not update the flashcard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentPick = async () => {
    try {
      const [res] = await DocumentPicker.pick({
        type: [DocumentPicker.types.plainText, DocumentPicker.types.pdf],
      });
      setDocument(res);
    } catch (err) {
      if (err) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Could not pick the document.');
        console.error(err);
      }
    }
  };

  const handleGenerateFlashcards = async () => {
    let data: any = {};
    let validationError = '';

    switch (generateMethod) {
      case 'topic':
        if (!topic.trim()) validationError = 'A topic is required.';
        data = { topic, num_cards: parseInt(numCards, 10) || 5 };
        break;
      case 'textarea':
        if (!textContent.trim()) validationError = 'Content is required.';
        data = { content: textContent };
        break;
      case 'document':
        if (!document) validationError = 'A document is required.';
        else {
          try {
            const fileContent = await RNFS.readFile(document.uri, 'utf8');
            data = { document_text: fileContent, num_cards: parseInt(numCards, 10) || 5 };
          } catch (e) {
            validationError = 'Could not read the document file.';
            console.error(e);
          }
        }
        break;
    }

    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      await learningAPI.generateFlashcards(generateMethod, packId, data);
      setGenerateModalVisible(false);
      setTopic('');
      setTextContent('');
      setDocument(null);
      setNumCards('5');
      await fetchPackDetails();
    } catch (e) {
      console.error('Failed to generate flashcards:', e);
      Alert.alert('Error', 'Could not generate flashcards.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFlashcard = async (cardId: number) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this flashcard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await learningAPI.deleteFlashcard(cardId);
              await fetchPackDetails();
            } catch (e) {
              console.error('Failed to delete flashcard:', e);
              Alert.alert('Error', 'Could not delete the flashcard.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const openEditModal = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setEditModalVisible(true);
  };

  const renderFlashcard = ({ item }: { item: Flashcard }) => (
    <Card style={styles.flashcard}>
      <Card.Content>
        <Paragraph style={styles.question}>{item.question}</Paragraph>
        <Paragraph style={styles.answer}>{item.answer}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <IconButton icon="pencil" onPress={() => openEditModal(item)} />
        <IconButton icon="trash-can-outline" onPress={() => handleDeleteFlashcard(item.id)} />
      </Card.Actions>
    </Card>
  );

  const ListHeader = () => (
    <View>
      {pack?.description && <Paragraph style={styles.description}>{pack.description}</Paragraph>}
      <View style={styles.buttonGroup}>
        <Button icon="plus-circle-outline" mode="contained" onPress={() => setAddModalVisible(true)} style={styles.actionButton}>
          Add Card
        </Button>
        <Button icon="robot-outline" mode="contained" onPress={() => setGenerateModalVisible(true)} style={styles.actionButton}>
          Generate
        </Button>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={styles.loader} />;
  }

  if (error) {
    return <View style={styles.centered}><Text>{error}</Text></View>;
  }

  return (
    <Portal.Host>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={pack?.title || 'Pack Details'} />
        </Appbar.Header>

        <FlatList
          data={pack?.flashcards || []}
          renderItem={renderFlashcard}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<Text style={styles.emptyText}>No flashcards yet. Add some!</Text>}
          contentContainerStyle={styles.content}
        />

        <Portal>
          <Modal visible={addModalVisible} onDismiss={() => setAddModalVisible(false)} contentContainerStyle={styles.modal}>
            <Title>Add New Flashcard</Title>
            <TextInput label="Question" value={newQuestion} onChangeText={setNewQuestion} mode="outlined" style={styles.input} />
            <TextInput label="Answer" value={newAnswer} onChangeText={setNewAnswer} mode="outlined" style={styles.input} multiline />
            <Button mode="contained" onPress={handleAddFlashcard} loading={isSubmitting} disabled={isSubmitting}>Add</Button>
            <Button onPress={() => setAddModalVisible(false)} disabled={isSubmitting} style={{ marginTop: 8 }}>Cancel</Button>
          </Modal>
        </Portal>

        <Portal>
          <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={styles.modal}>
            <Title>Edit Flashcard</Title>
            <TextInput
              label="Question"
              value={editingFlashcard?.question || ''}
              onChangeText={(text) => setEditingFlashcard(editingFlashcard ? { ...editingFlashcard, question: text } : null)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Answer"
              value={editingFlashcard?.answer || ''}
              onChangeText={(text) => setEditingFlashcard(editingFlashcard ? { ...editingFlashcard, answer: text } : null)}
              mode="outlined"
              style={styles.input}
              multiline
            />
            <Button mode="contained" onPress={handleEditFlashcard} loading={isSubmitting} disabled={isSubmitting}>Save</Button>
            <Button onPress={() => setEditModalVisible(false)} disabled={isSubmitting} style={{ marginTop: 8 }}>Cancel</Button>
          </Modal>
        </Portal>

        <Portal>
          <Modal visible={generateModalVisible} onDismiss={() => setGenerateModalVisible(false)} contentContainerStyle={styles.modal}>
            <Title>Generate Flashcards</Title>
            <SegmentedButtons
              value={generateMethod}
              onValueChange={setGenerateMethod}
              buttons={[
                { value: 'topic', label: 'Topic' },
                { value: 'textarea', label: 'Text' },
                { value: 'document', label: 'Document' },
              ]}
              style={styles.input}
            />
            {generateMethod === 'topic' && (
              <>
                <TextInput label="Topic" value={topic} onChangeText={setTopic} mode="outlined" style={styles.input} />
                <TextInput label="Number of Cards" value={numCards} onChangeText={setNumCards} keyboardType="numeric" mode="outlined" style={styles.input} />
              </>
            )}
            {generateMethod === 'textarea' && (
              <TextInput label="Content" value={textContent} onChangeText={setTextContent} mode="outlined" style={styles.input} multiline numberOfLines={4} />
            )}
            {generateMethod === 'document' && (
              <>
                <Button onPress={handleDocumentPick} mode="outlined" style={styles.input}>Choose File</Button>
                {document && <Text style={styles.fileName}>{document.name}</Text>}
                <TextInput label="Number of Cards" value={numCards} onChangeText={setNumCards} keyboardType="numeric" mode="outlined" style={styles.input} />
              </>
            )}
            <Button mode="contained" onPress={handleGenerateFlashcards} loading={isSubmitting} disabled={isSubmitting}>Generate</Button>
            <Button onPress={() => setGenerateModalVisible(false)} disabled={isSubmitting} style={{ marginTop: 8 }}>Cancel</Button>
          </Modal>
        </Portal>
      </View>
    </Portal.Host>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  description: { fontSize: 16, marginBottom: 16, color: '#6b7280' },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  actionButton: { flex: 1, marginHorizontal: 8 },
  flashcard: { marginBottom: 12 },
  question: { fontWeight: 'bold' },
  answer: { marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#6b7280' },
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8 },
  input: { marginBottom: 12 },
  fileName: { textAlign: 'center', marginBottom: 12, color: '#6b7280' },
});

export default PackDetailScreen;
