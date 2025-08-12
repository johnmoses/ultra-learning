import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { TextInput, Button, Card, Paragraph, Appbar } from 'react-native-paper';
import { chatAPI } from '../services/api';
import { ChatMessage } from '../types';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { room } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages(room.id); 
  }, [room]);

  const loadMessages = async (roomId: number) => {
    try {
      const data = await chatAPI.getMessages(roomId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);
    try {
      const response = await chatAPI.sendMessage(room.id, newMessage, 'user');
      setMessages(response.conversation);
      setNewMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <Card style={[styles.messageCard, item.role === 'user' ? styles.userMessage : styles.botMessage]}>
      <Card.Content>
        <Paragraph>{item.content}</Paragraph>
      </Card.Content>
    </Card>
  );
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={room.name} />
      </Appbar.Header>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          style={styles.textInput}
          mode="outlined"
          multiline
        />
        <Button
          mode="contained"
          onPress={sendMessage}
          loading={loading}
          disabled={!newMessage.trim()}
          style={styles.sendButton}
        >
          Send
        </Button>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  messageCard: {
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
    maxWidth: '80%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    maxWidth: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    alignSelf: 'flex-end',
  },
});
export default ChatScreen;