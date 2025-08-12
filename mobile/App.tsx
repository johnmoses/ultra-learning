import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <PaperProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </PaperProvider>
  );
}

export default App;


// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
// import { authAPI, learningAPI, chatAPI, dashboardAPI } from './src/services/api';

// const EngagementScreen = () => {
//   const [stats, setStats] = useState({
//     totalFlashcards: 0,
//     studySessions: 0,
//     currentStreak: 0,
//     totalStudyTime: 0
//   });
//   const [recentSessions, setRecentSessions] = useState<Array<{
//     id: number;
//     date: string;
//     duration: number;
//     subject: string;
//     completed: boolean;
//   }>>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadEngagementData();
//   }, []);

//   // Reload data when screen becomes active
//   useEffect(() => {
//     const interval = setInterval(() => {
//       loadEngagementData();
//     }, 5000); // Refresh every 5 seconds when screen is active
    
//     return () => clearInterval(interval);
//   }, []);

//   const loadEngagementData = async () => {
//     try {
//       console.log('Loading engagement data...');
//       const dashboardData = await dashboardAPI.getStats();
//       console.log('Dashboard data received:', dashboardData);
      
//       setStats({
//         totalFlashcards: dashboardData.total_flashcards || 0,
//         studySessions: dashboardData.study_sessions || 0,
//         currentStreak: dashboardData.current_streak || 0,
//         totalStudyTime: dashboardData.total_study_time || 0
//       });
      
//       setRecentSessions(dashboardData.recent_sessions || []);
//     } catch (error) {
//       console.log('Failed to load engagement data:', error);
//       // Use mock data when API fails
//       setStats({
//         totalFlashcards: 15,
//         studySessions: 8,
//         currentStreak: 3,
//         totalStudyTime: 1200 // 20 minutes in seconds
//       });
      
//       setRecentSessions([
//         { id: 1, date: new Date().toISOString(), duration: 25, subject: 'JavaScript Basics', completed: true },
//         { id: 2, date: new Date(Date.now() - 86400000).toISOString(), duration: 30, subject: 'React Components', completed: true },
//         { id: 3, date: new Date(Date.now() - 172800000).toISOString(), duration: 15, subject: 'CSS Flexbox', completed: false }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStatCard = (title: string, value: string | number, icon: string) => (
//     <View style={styles.statCard}>
//       <Text style={styles.statIcon}>{icon}</Text>
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statTitle}>{title}</Text>
//     </View>
//   );

//   const renderSession = ({ item }: { item: any }) => (
//     <View style={styles.sessionCard}>
//       <View style={styles.sessionHeader}>
//         <Text style={styles.sessionSubject}>{item.subject}</Text>
//         <Text style={[styles.sessionStatus, item.completed ? styles.completed : styles.incomplete]}>
//           {item.completed ? '✓ Completed' : '⏸ Incomplete'}
//         </Text>
//       </View>
//       <Text style={styles.sessionDate}>{new Date(item.date).toLocaleDateString()}</Text>
//       <Text style={styles.sessionDuration}>{item.duration} minutes</Text>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.screen}>
//         <Text style={styles.title}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.screenTitle}>Learning Progress</Text>
//         <TouchableOpacity style={styles.createButton} onPress={loadEngagementData}>
//           <Text style={styles.createButtonText}>Refresh</Text>
//         </TouchableOpacity>
//       </View>
      
//       <ScrollView style={styles.engagementContent}>
//         <Text style={styles.sectionTitle}>Your Stats</Text>
//         <View style={styles.statsGrid}>
//           {renderStatCard('Flashcards', stats.totalFlashcards, '📚')}
//           {renderStatCard('Sessions', stats.studySessions, '🎯')}
//           {renderStatCard('Streak', `${stats.currentStreak} days`, '🔥')}
//           {renderStatCard('Study Time', `${Math.round(stats.totalStudyTime / 60)}h`, '⏱️')}
//         </View>
        
//         <Text style={styles.sectionTitle}>Recent Sessions</Text>
//         {recentSessions.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyText}>No study sessions yet</Text>
//             <Text>Start studying to track your progress!</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={recentSessions}
//             renderItem={renderSession}
//             keyExtractor={(item) => item.id.toString()}
//             scrollEnabled={false}
//           />
//         )}
        
//         <View style={styles.motivationCard}>
//           <Text style={styles.motivationTitle}>Keep it up! 🌟</Text>
//           <Text style={styles.motivationText}>
//             You're doing great! Consistency is key to mastering new concepts.
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const DashboardScreen = () => {
//   const [stats, setStats] = useState({
//     totalFlashcards: 0,
//     studySessions: 0,
//     currentStreak: 0,
//     totalStudyTime: 0
//   });
//   const [overview, setOverview] = useState<{
//     total_courses: number;
//     completed_courses: number;
//     total_messages: number;
//     engagement_score: number;
//     recent_activity: Array<{ date: string; activity_count: number }>;
//   }>({
//     total_courses: 0,
//     completed_courses: 0,
//     total_messages: 0,
//     engagement_score: 0,
//     recent_activity: []
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       const [statsData, overviewData] = await Promise.all([
//         dashboardAPI.getStats(),
//         dashboardAPI.getOverview()
//       ]);
      
//       setStats({
//         totalFlashcards: statsData.total_flashcards || 0,
//         studySessions: statsData.study_sessions || 0,
//         currentStreak: statsData.current_streak || 0,
//         totalStudyTime: statsData.total_study_time || 0
//       });
      
//       setOverview(overviewData);
//     } catch (error) {
//       console.log('Failed to load dashboard data:', error);
//       // Use fallback data
//       setStats({
//         totalFlashcards: 12,
//         studySessions: 5,
//         currentStreak: 2,
//         totalStudyTime: 900
//       });
//       setOverview({
//         total_courses: 3,
//         completed_courses: 5,
//         total_messages: 8,
//         engagement_score: 75,
//         recent_activity: [
//           { date: '2024-01-15', activity_count: 12 },
//           { date: '2024-01-16', activity_count: 8 },
//           { date: '2024-01-17', activity_count: 15 }
//         ]
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
//     <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
//       <Text style={styles.statIcon}>{icon}</Text>
//       <Text style={[styles.statValue, { color }]}>{value}</Text>
//       <Text style={styles.statTitle}>{title}</Text>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.screen}>
//         <Text style={styles.title}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.screenTitle}>Dashboard</Text>
//         <TouchableOpacity style={styles.createButton} onPress={loadDashboardData}>
//           <Text style={styles.createButtonText}>Refresh</Text>
//         </TouchableOpacity>
//       </View>
      
//       <ScrollView style={styles.engagementContent}>
//         <Text style={styles.sectionTitle}>Learning Overview</Text>
//         <View style={styles.statsGrid}>
//           {renderStatCard('Flashcards', stats.totalFlashcards, '📚', '#6366f1')}
//           {renderStatCard('Sessions', stats.studySessions, '🎯', '#10b981')}
//           {renderStatCard('Streak', `${stats.currentStreak} days`, '🔥', '#f59e0b')}
//           {renderStatCard('Study Time', `${Math.round(stats.totalStudyTime / 60)}m`, '⏱️', '#ef4444')}
//         </View>
        
//         <Text style={styles.sectionTitle}>Activity Summary</Text>
//         <View style={styles.statsGrid}>
//           {renderStatCard('Packs', overview.total_courses, '📦', '#8b5cf6')}
//           {renderStatCard('Completed', overview.completed_courses, '✅', '#10b981')}
//           {renderStatCard('Messages', overview.total_messages, '💬', '#3b82f6')}
//           {renderStatCard('Score', `${overview.engagement_score}%`, '⭐', '#f59e0b')}
//         </View>
        
//         <Text style={styles.sectionTitle}>Recent Activity</Text>
//         {overview.recent_activity.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyText}>No recent activity</Text>
//             <Text>Start learning to see your progress!</Text>
//           </View>
//         ) : (
//           <View style={styles.activityChart}>
//             {overview.recent_activity.map((item: any, index: number) => (
//               <View key={index} style={styles.activityItem}>
//                 <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString()}</Text>
//                 <View style={styles.activityBar}>
//                   <View style={[styles.activityFill, { width: `${Math.min(item.activity_count * 10, 100)}%` }]} />
//                 </View>
//                 <Text style={styles.activityCount}>{item.activity_count}</Text>
//               </View>
//             ))}
//           </View>
//         )}
        
//         <View style={styles.motivationCard}>
//           <Text style={styles.motivationTitle}>Welcome to UltraLearning! 🚀</Text>
//           <Text style={styles.motivationText}>
//             Track your progress, build streaks, and master new skills with our comprehensive learning platform.
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const ChatScreen = () => {
//   const [currentView, setCurrentView] = useState('rooms'); // 'rooms' or 'chat'
//   const [rooms, setRooms] = useState([]);
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newRoomName, setNewRoomName] = useState('');
//   const [newRoomDescription, setNewRoomDescription] = useState('');

//   useEffect(() => {
//     if (currentView === 'rooms') {
//       loadRooms();
//     }
//   }, [currentView]);

//   const loadRooms = async () => {
//     try {
//       const data = await chatAPI.getRooms();
//       setRooms(data || []);
//     } catch (error) {
//       console.log('Failed to load chat rooms:', error);
//       Alert.alert('Error', 'Failed to load chat rooms');
//     }
//   };

//   const createRoom = async () => {
//     if (!newRoomName.trim()) {
//       Alert.alert('Error', 'Please enter a room name');
//       return;
//     }

//     try {
//       await chatAPI.createRoom(newRoomName.trim(), newRoomDescription.trim() || undefined);
//       setNewRoomName('');
//       setNewRoomDescription('');
//       setShowCreateModal(false);
//       loadRooms();
//       Alert.alert('Success', 'Room created successfully!');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to create room');
//     }
//   };

//   const joinRoom = async (room: any) => {
//     try {
//       setSelectedRoom(room);
//       const roomMessages = await chatAPI.getMessages(room.id);
//       setMessages(roomMessages || []);
//       setCurrentView('chat');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to join room');
//     }
//   };

//   const sendMessage = async () => {
//     if (!inputText.trim() || !selectedRoom) return;

//     try {
//       await chatAPI.sendMessage(selectedRoom.id, inputText, 'user');
//       const roomMessages = await chatAPI.getMessages(selectedRoom.id);
//       setMessages(roomMessages || []);
//       setInputText('');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to send message');
//     }
//   };

//   const renderRoom = ({ item }: { item: any }) => (
//     <View style={styles.roomCard}>
//       <Text style={styles.roomName}>{item.name}</Text>
//       <Text style={styles.roomDescription}>{item.description || 'No description'}</Text>
//       <Text style={styles.roomMeta}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
//       <TouchableOpacity 
//         style={styles.joinButton}
//         onPress={() => joinRoom(item)}
//       >
//         <Text style={styles.joinButtonText}>Join Room</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderMessage = ({ item }: { item: any }) => (
//     <View style={[
//       styles.messageContainer,
//       item.role === 'user' ? styles.userMessage : styles.aiMessage
//     ]}>
//       <Text style={styles.senderName}>{item.sender_name || item.role}</Text>
//       <Text style={styles.messageText}>{item.content}</Text>
//       <Text style={styles.messageTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
//     </View>
//   );

//   if (currentView === 'rooms') {
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.screenTitle}>Chat Rooms</Text>
//           <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
//             <Text style={styles.createButtonText}>+ New Room</Text>
//           </TouchableOpacity>
//         </View>
        
//         {showCreateModal && (
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalTitle}>Create New Room</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Room Name"
//                 value={newRoomName}
//                 onChangeText={setNewRoomName}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Description (optional)"
//                 value={newRoomDescription}
//                 onChangeText={setNewRoomDescription}
//                 multiline
//               />
//               <View style={styles.modalButtons}>
//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.cancelButton]} 
//                   onPress={() => {
//                     setShowCreateModal(false);
//                     setNewRoomName('');
//                     setNewRoomDescription('');
//                   }}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.modalButton, styles.createModalButton]} onPress={createRoom}>
//                   <Text style={styles.createModalButtonText}>Create</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
        
//         {rooms.length === 0 ? (
//           <View style={styles.screen}>
//             <Text style={styles.subtitle}>No chat rooms found</Text>
//             <Text>Create your first chat room to get started!</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={rooms}
//             renderItem={renderRoom}
//             keyExtractor={(item) => item.id.toString()}
//             contentContainerStyle={styles.roomsList}
//             showsVerticalScrollIndicator={false}
//           />
//         )}
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => setCurrentView('rooms')}>
//           <Text style={styles.backButton}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.screenTitle}>{selectedRoom?.name}</Text>
//       </View>
      
//       <FlatList
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.id.toString()}
//         style={styles.messagesList}
//         contentContainerStyle={styles.messagesContent}
//         showsVerticalScrollIndicator={false}
//       />
      
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.messageInput}
//           placeholder="Type your message..."
//           value={inputText}
//           onChangeText={setInputText}
//           multiline
//           maxLength={500}
//         />
//         <TouchableOpacity 
//           style={[styles.sendButton, !inputText.trim() && styles.disabledButton]}
//           onPress={sendMessage}
//           disabled={!inputText.trim()}
//         >
//           <Text style={styles.sendButtonText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const LearningScreen = ({ onStudyPack, onEditPack, onCreatePack }: { onStudyPack: (pack: any) => void; onEditPack: (pack: any) => void; onCreatePack: () => void }) => {
//   const [packs, setPacks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadPacks();
//   }, []);

//   const loadPacks = async () => {
//     try {
//       const data = await learningAPI.getPacks();
//       setPacks(data || []);
//     } catch (error: any) {
//       console.log('Failed to load flashcard packs:', error);
//       const errorMsg = error.response?.data?.error || 'Failed to load flashcard packs';
//       Alert.alert('Error', errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreatePack = () => {
//     onCreatePack();
//   };

//   const handleStudyPack = (pack: any) => {
//     onStudyPack(pack);
//   };

//   const handleEditPack = (pack: any) => {
//     onEditPack(pack);
//   };

//   const renderPack = ({ item }: { item: any }) => (
//     <View style={styles.packCard}>
//       <Text style={styles.packTitle}>{item.title}</Text>
//       <Text style={styles.packDescription}>{item.description || 'No description'}</Text>
//       <Text style={styles.packMeta}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
      
//       <View style={styles.packActions}>
//         <TouchableOpacity 
//           style={[styles.actionButton, styles.studyButton]} 
//           onPress={() => handleStudyPack(item)}
//         >
//           <Text style={styles.actionButtonText}>Study</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[styles.actionButton, styles.editButton]} 
//           onPress={() => handleEditPack(item)}
//         >
//           <Text style={styles.actionButtonText}>Edit</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.screen}>
//         <Text style={styles.title}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.screenTitle}>Flashcard Packs</Text>
//         <TouchableOpacity style={styles.createButton} onPress={handleCreatePack}>
//           <Text style={styles.createButtonText}>+ New Pack</Text>
//         </TouchableOpacity>
//       </View>
      
//       {packs.length === 0 ? (
//         <View style={styles.screen}>
//           <Text style={styles.subtitle}>No flashcard packs found</Text>
//           <Text>Create your first flashcard pack to get started!</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={packs}
//           renderItem={renderPack}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={styles.packsList}
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//     </View>
//   );
// };

// const StudyScreen = ({ pack, onBack }: { pack: any; onBack: () => void }) => {
//   const [flashcards, setFlashcards] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [sessionStartTime, setSessionStartTime] = useState(Date.now());

//   useEffect(() => {
//     loadFlashcards();
//   }, []);

//   const loadFlashcards = async () => {
//     try {
//       const data = await learningAPI.getFlashcards(pack.id);
//       setFlashcards(data);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load flashcards');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logStudySession = async (completed: boolean) => {
//     try {
//       const duration = Math.round((Date.now() - sessionStartTime) / 1000); // seconds
//       await learningAPI.logSession({
//         duration,
//         subject: pack.title,
//         completed
//       });
//     } catch (error) {
//       console.log('Failed to log study session:', error);
//     }
//   };

//   const handleDifficulty = (difficulty: string) => {
//     // Move to next card or finish session
//     if (currentIndex < flashcards.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//       setShowAnswer(false);
//     } else {
//       // Session complete - log it
//       logStudySession(true);
//       Alert.alert(
//         'Study Complete!',
//         `You've completed all ${flashcards.length} flashcards.`,
//         [{ text: 'Back to Packs', onPress: onBack }]
//       );
//     }
//   };

//   const handleBack = () => {
//     // Log incomplete session when user exits early
//     if (currentIndex < flashcards.length - 1) {
//       logStudySession(false);
//     }
//     onBack();
//   };

//   if (loading) {
//     return (
//       <View style={styles.screen}>
//         <Text style={styles.title}>Loading flashcards...</Text>
//       </View>
//     );
//   }

//   if (flashcards.length === 0) {
//     return (
//       <View style={styles.screen}>
//         <Text style={styles.title}>No flashcards found</Text>
//         <TouchableOpacity style={styles.button} onPress={onBack}>
//           <Text style={styles.buttonText}>Back to Packs</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const currentCard = flashcards[currentIndex];

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBack}>
//           <Text style={styles.backButton}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.screenTitle}>{pack.title}</Text>
//         <Text style={styles.cardCounter}>{currentIndex + 1}/{flashcards.length}</Text>
//       </View>
      
//       <View style={styles.cardContainer}>
//         <View style={styles.flashcard}>
//           <Text style={styles.cardLabel}>{showAnswer ? 'Answer' : 'Question'}</Text>
//           <Text style={styles.cardText}>
//             {showAnswer ? currentCard.answer : currentCard.question}
//           </Text>
//         </View>
        
//         {!showAnswer ? (
//           <TouchableOpacity 
//             style={styles.flipButton} 
//             onPress={() => setShowAnswer(true)}
//           >
//             <Text style={styles.buttonText}>Show Answer</Text>
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.difficultyButtons}>
//             <Text style={styles.difficultyLabel}>How difficult was this?</Text>
//             <TouchableOpacity 
//               style={[styles.difficultyButton, styles.easyButton]} 
//               onPress={() => handleDifficulty('easy')}
//             >
//               <Text style={styles.difficultyButtonText}>Easy</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[styles.difficultyButton, styles.mediumButton]} 
//               onPress={() => handleDifficulty('medium')}
//             >
//               <Text style={styles.difficultyButtonText}>Medium</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[styles.difficultyButton, styles.hardButton]} 
//               onPress={() => handleDifficulty('hard')}
//             >
//               <Text style={styles.difficultyButtonText}>Hard</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// const EditPackScreen = ({ pack, onBack, onSave }: { pack: any; onBack: () => void; onSave: () => void }) => {
//   const [flashcards, setFlashcards] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newQuestion, setNewQuestion] = useState('');
//   const [newAnswer, setNewAnswer] = useState('');
//   const [generateMethod, setGenerateMethod] = useState('manual');
//   const [textareaContent, setTextareaContent] = useState('');
//   const [topic, setTopic] = useState('');
//   const [numCards, setNumCards] = useState('5');
//   const [documentText, setDocumentText] = useState('');
//   const [generating, setGenerating] = useState(false);

//   useEffect(() => {
//     loadFlashcards();
//   }, []);

//   const loadFlashcards = async () => {
//     try {
//       const data = await learningAPI.getFlashcards(pack.id);
//       setFlashcards(data);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load flashcards');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addFlashcard = async () => {
//     if (!newQuestion || !newAnswer) {
//       Alert.alert('Error', 'Please enter both question and answer');
//       return;
//     }

//     try {
//       await learningAPI.createFlashcard(newQuestion, newAnswer, pack.id);
//       setNewQuestion('');
//       setNewAnswer('');
//       loadFlashcards();
//       Alert.alert('Success', 'Flashcard added!');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to add flashcard');
//     }
//   };

//   const generateFlashcards = async () => {
//     if (generating) return; // Prevent multiple requests
    
//     try {
//       setGenerating(true);
//       let data = {};
      
//       if (generateMethod === 'textarea') {
//         if (!textareaContent) {
//           Alert.alert('Error', 'Please enter content');
//           return;
//         }
//         data = { content: textareaContent };
//       } else if (generateMethod === 'topic') {
//         if (!topic) {
//           Alert.alert('Error', 'Please enter a topic');
//           return;
//         }
//         data = { topic, num_cards: parseInt(numCards) || 5 };
//       } else if (generateMethod === 'document') {
//         if (!documentText) {
//           Alert.alert('Error', 'Please enter document text');
//           return;
//         }
//         data = { document_text: documentText, num_cards: parseInt(numCards) || 5 };
//       }

//       console.log('Generating flashcards:', { method: generateMethod, pack_id: pack.id, data });
//       const result = await learningAPI.generateFlashcards(generateMethod, pack.id, data);
//       console.log('Generation result:', result);
      
//       if (result && result.created_flashcards_count !== undefined) {
//         loadFlashcards();
//         Alert.alert('Success', `Generated ${result.created_flashcards_count} flashcards!`);
        
//         // Clear form
//         setTextareaContent('');
//         setTopic('');
//         setDocumentText('');
//       } else {
//         console.log('Unexpected result format:', result);
//         loadFlashcards(); // Still reload to show any cards that were created
//         Alert.alert('Warning', 'Flashcards may have been generated. Please check the list.');
//       }
//     } catch (error: any) {
//       console.log('Generation error:', error);
//       console.log('Error response:', error.response);
      
//       // Always reload flashcards in case some were created despite the error
//       loadFlashcards();
      
//       if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
//         Alert.alert('Timeout', 'Generation is taking longer than expected. Flashcards may have been created. Please check the list below.');
//       } else {
//         const errorMsg = error.response?.data?.error || error.message || 'Failed to generate flashcards';
//         Alert.alert('Error', `${errorMsg}\n\nNote: Some flashcards may have been created. Check the list below.`);
//       }
//     } finally {
//       setGenerating(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={onBack}>
//           <Text style={styles.backButton}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.screenTitle}>Edit {pack.title}</Text>
//         <TouchableOpacity onPress={onSave}>
//           <Text style={styles.saveButton}>Save</Text>
//         </TouchableOpacity>
//       </View>
      
//       <ScrollView style={styles.editContent}>
//         <Text style={styles.sectionTitle}>Generate Flashcards</Text>
        
//         <View style={styles.methodSelector}>
//           <TouchableOpacity 
//             style={[styles.methodButton, generateMethod === 'manual' && styles.activeMethod]}
//             onPress={() => setGenerateMethod('manual')}
//           >
//             <Text style={styles.methodText}>Manual</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[styles.methodButton, generateMethod === 'textarea' && styles.activeMethod]}
//             onPress={() => setGenerateMethod('textarea')}
//           >
//             <Text style={styles.methodText}>Text</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[styles.methodButton, generateMethod === 'topic' && styles.activeMethod]}
//             onPress={() => setGenerateMethod('topic')}
//           >
//             <Text style={styles.methodText}>Topic</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[styles.methodButton, generateMethod === 'document' && styles.activeMethod]}
//             onPress={() => setGenerateMethod('document')}
//           >
//             <Text style={styles.methodText}>Document</Text>
//           </TouchableOpacity>
//         </View>

//         {generateMethod === 'manual' && (
//           <View>
//             <TextInput
//               style={styles.input}
//               placeholder="Question"
//               value={newQuestion}
//               onChangeText={setNewQuestion}
//               multiline
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Answer"
//               value={newAnswer}
//               onChangeText={setNewAnswer}
//               multiline
//             />
//             <TouchableOpacity style={styles.button} onPress={addFlashcard}>
//               <Text style={styles.buttonText}>Add Flashcard</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {generateMethod === 'textarea' && (
//           <View>
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               placeholder="Enter content (Question | Answer format or plain text)"
//               value={textareaContent}
//               onChangeText={setTextareaContent}
//               multiline
//             />
//             <TouchableOpacity style={styles.button} onPress={generateFlashcards}>
//               <Text style={styles.buttonText}>Generate from Text</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {generateMethod === 'topic' && (
//           <View>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter topic (e.g., 'JavaScript basics')"
//               value={topic}
//               onChangeText={setTopic}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Number of cards"
//               value={numCards}
//               onChangeText={setNumCards}
//               keyboardType="numeric"
//             />
//             <TouchableOpacity 
//               style={[styles.button, generating && styles.disabledButton]} 
//               onPress={generateFlashcards}
//               disabled={generating}
//             >
//               <Text style={styles.buttonText}>
//                 {generating ? 'Generating...' : 'Generate from Topic'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {generateMethod === 'document' && (
//           <View>
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               placeholder="Paste document text here"
//               value={documentText}
//               onChangeText={setDocumentText}
//               multiline
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Number of cards"
//               value={numCards}
//               onChangeText={setNumCards}
//               keyboardType="numeric"
//             />
//             <TouchableOpacity style={styles.button} onPress={generateFlashcards}>
//               <Text style={styles.buttonText}>Generate from Document</Text>
//             </TouchableOpacity>
//           </View>
//         )}
        
//         <Text style={styles.sectionTitle}>Existing Flashcards ({flashcards.length})</Text>
//         {flashcards.map((card: any, index: number) => (
//           <View key={card.id} style={styles.flashcardItem}>
//             <Text style={styles.flashcardQuestion}>Q: {card.question}</Text>
//             <Text style={styles.flashcardAnswer}>A: {card.answer}</Text>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// };

// const CreatePackScreen = ({ onBack, onSave }: { onBack: () => void; onSave: (title: string, description?: string) => void }) => {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');

//   const handleSave = () => {
//     if (!title.trim()) {
//       Alert.alert('Error', 'Please enter a pack title');
//       return;
//     }
//     onSave(title.trim(), description.trim() || undefined);
//   };

//   return (
//     <View style={styles.screen}>
//       <Text style={styles.title}>Create New Pack</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Pack Title"
//         value={title}
//         onChangeText={setTitle}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Description (optional)"
//         value={description}
//         onChangeText={setDescription}
//         multiline
//       />
//       <TouchableOpacity style={styles.button} onPress={handleSave}>
//         <Text style={styles.buttonText}>Create Pack</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={onBack}>
//         <Text style={styles.linkText}>Cancel</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const RegisterScreen = ({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const handleRegister = async () => {
//     if (!username || !email || !password || !confirmPassword) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     if (password !== confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match');
//       return;
//     }

//     try {
//       await authAPI.register(username, email, password);
//       Alert.alert('Success', 'Account created successfully!', [
//         { text: 'OK', onPress: onSuccess }
//       ]);
//     } catch (error: any) {
//       console.log('Registration error:', error);
//       const errorMsg = error.response?.data?.error || error.message || 'Registration failed';
//       Alert.alert('Registration Failed', errorMsg);
//     }
//   };

//   return (
//     <View style={styles.screen}>
//       <Text style={styles.title}>Create Account</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Username"
//         value={username}
//         onChangeText={setUsername}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Confirm Password"
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//         secureTextEntry
//       />
//       <TouchableOpacity style={styles.button} onPress={handleRegister}>
//         <Text style={styles.buttonText}>Register</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={onBack}>
//         <Text style={styles.linkText}>Already have an account? Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const App = () => {
//   const [currentScreen, setCurrentScreen] = useState('dashboard');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [selectedPack, setSelectedPack] = useState(null);

//   const handleLogin = async () => {
//     if (!username || !password) {
//       Alert.alert('Error', 'Please enter username and password');
//       return;
//     }

//     try {
//       const response = await authAPI.login(username, password);
//       console.log('Login response:', response);
      
//       // Store tokens
//       const AsyncStorage = require('@react-native-async-storage/async-storage').default;
//       await AsyncStorage.setItem('access_token', response.access_token);
//       if (response.refresh_token) {
//         await AsyncStorage.setItem('refresh_token', response.refresh_token);
//       }
      
//       setUser(response.user);
//       setIsAuthenticated(true);
//       setCurrentScreen('dashboard');
//       setUsername('');
//       setPassword('');
//       Alert.alert('Success', `Welcome ${response.user.username}!`);
//     } catch (error: any) {
//       const errorMsg = error.response?.data?.error || error.message || 'Login failed';
//       Alert.alert('Login Failed', errorMsg);
//       console.log('Login error:', error);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
//       // Clear all stored tokens
//       await AsyncStorage.removeItem('access_token');
//       await AsyncStorage.removeItem('refresh_token');
      
//       // Reset all app state
//       setIsAuthenticated(false);
//       setUser(null);
//       setSelectedPack(null);
//       setUsername('');
//       setPassword('');
      
//       // Go to login screen
//       setCurrentScreen('profile');
      
//       Alert.alert('Success', 'Logged out successfully');
//     } catch (error) {
//       console.log('Logout error:', error);
//       Alert.alert('Error', 'Failed to logout properly');
//     }
//   };

//   const handleStudyPack = (pack: any) => {
//     setSelectedPack(pack);
//     setCurrentScreen('study');
//   };

//   const handleEditPack = (pack: any) => {
//     setSelectedPack(pack);
//     setCurrentScreen('edit');
//   };

//   const handleCreatePack = () => {
//     setCurrentScreen('createPack');
//   };

//   const renderScreen = () => {
//     switch (currentScreen) {
//       case 'dashboard':
//         return (
//           <DashboardScreen />
//         );
//       case 'chat':
//         return (
//           <ChatScreen />
//         );
//       case 'learning':
//         return (
//           <LearningScreen 
//             onStudyPack={handleStudyPack}
//             onEditPack={handleEditPack}
//             onCreatePack={handleCreatePack}
//           />
//         );
//       case 'engagement':
//         return (
//           <EngagementScreen key={Date.now()} />
//         );
//       case 'profile':
//         if (isAuthenticated) {
//           return (
//             <View style={styles.screen}>
//               <Text style={styles.title}>Profile</Text>
//               <Text style={styles.subtitle}>Welcome, {user?.username}!</Text>
//               <Text style={styles.userInfo}>Email: {user?.email}</Text>
//               <Text style={styles.userInfo}>Role: {user?.role}</Text>
//               <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//                 <Text style={styles.buttonText}>Logout</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         } else {
//           return (
//             <View style={styles.screen}>
//               <Text style={styles.title}>Login</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Username"
//                 value={username}
//                 onChangeText={setUsername}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Password"
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry
//               />
//               <TouchableOpacity style={styles.button} onPress={handleLogin}>
//                 <Text style={styles.buttonText}>Login</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setCurrentScreen('register')}>
//                 <Text style={styles.linkText}>Don't have an account? Register</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         }
//       case 'register':
//         return (
//           <RegisterScreen 
//             onSuccess={() => {
//               setIsAuthenticated(true);
//               setCurrentScreen('dashboard');
//             }} 
//             onBack={() => setCurrentScreen('profile')} 
//           />
//         );
//       case 'study':
//         return (
//           <StudyScreen 
//             pack={selectedPack} 
//             onBack={() => setCurrentScreen('learning')} 
//           />
//         );
//       case 'edit':
//         return (
//           <EditPackScreen 
//             pack={selectedPack} 
//             onBack={() => setCurrentScreen('learning')}
//             onSave={() => {
//               setCurrentScreen('learning');
//               // Reload packs if needed
//             }}
//           />
//         );
//       case 'createPack':
//         return (
//           <CreatePackScreen 
//             onBack={() => setCurrentScreen('learning')}
//             onSave={async (title, description) => {
//               try {
//                 await learningAPI.createPack(title, description);
//                 Alert.alert('Success', 'Pack created successfully!');
//                 setCurrentScreen('learning');
//               } catch (error) {
//                 Alert.alert('Error', 'Failed to create pack');
//               }
//             }}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.appTitle}>UltraLearning</Text>
      
//       {renderScreen()}
      
//       <View style={styles.tabBar}>
//         <TouchableOpacity 
//           style={[styles.tab, currentScreen === 'dashboard' && styles.activeTab, !isAuthenticated && styles.disabledTab]}
//           onPress={() => isAuthenticated && setCurrentScreen('dashboard')}
//           disabled={!isAuthenticated}
//         >
//           <Text style={[styles.tabText, !isAuthenticated && styles.disabledTabText]}>Dashboard</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.tab, currentScreen === 'chat' && styles.activeTab, !isAuthenticated && styles.disabledTab]}
//           onPress={() => isAuthenticated && setCurrentScreen('chat')}
//           disabled={!isAuthenticated}
//         >
//           <Text style={[styles.tabText, !isAuthenticated && styles.disabledTabText]}>Chat</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.tab, currentScreen === 'learning' && styles.activeTab, !isAuthenticated && styles.disabledTab]}
//           onPress={() => isAuthenticated && setCurrentScreen('learning')}
//           disabled={!isAuthenticated}
//         >
//           <Text style={[styles.tabText, !isAuthenticated && styles.disabledTabText]}>Learning</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.tab, currentScreen === 'engagement' && styles.activeTab, !isAuthenticated && styles.disabledTab]}
//           onPress={() => isAuthenticated && setCurrentScreen('engagement')}
//           disabled={!isAuthenticated}
//         >
//           <Text style={[styles.tabText, !isAuthenticated && styles.disabledTabText]}>Engagement</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.tab, currentScreen === 'profile' && styles.activeTab]}
//           onPress={() => setCurrentScreen('profile')}
//         >
//           <Text style={styles.tabText}>Profile</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   appTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     paddingTop: 50,
//     paddingBottom: 20,
//     backgroundColor: '#6366f1',
//     color: '#fff',
//   },
//   screen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 20,
//     color: '#666',
//   },
//   input: {
//     width: '100%',
//     padding: 15,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: '#6366f1',
//     padding: 15,
//     borderRadius: 8,
//     width: '100%',
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   tabBar: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#e5e7eb',
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 15,
//     alignItems: 'center',
//   },
//   activeTab: {
//     backgroundColor: '#6366f1',
//   },
//   tabText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   disabledTab: {
//     opacity: 0.5,
//   },
//   disabledTabText: {
//     color: '#ccc',
//   },
//   linkText: {
//     color: '#6366f1',
//     textAlign: 'center',
//     marginTop: 15,
//     fontSize: 14,
//   },
//   userInfo: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   logoutButton: {
//     backgroundColor: '#ef4444',
//     padding: 15,
//     borderRadius: 8,
//     width: '100%',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     backgroundColor: '#6366f1',
//   },
//   screenTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   createButton: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   createButtonText: {
//     color: '#6366f1',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   packsList: {
//     padding: 16,
//   },
//   packCard: {
//     backgroundColor: '#fff',
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   packTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   packDescription: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//   },
//   packMeta: {
//     fontSize: 12,
//     color: '#888',
//     marginTop: 8,
//     marginBottom: 12,
//   },
//   packActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   actionButton: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     marginHorizontal: 4,
//     alignItems: 'center',
//   },
//   studyButton: {
//     backgroundColor: '#10b981',
//   },
//   editButton: {
//     backgroundColor: '#f59e0b',
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   backButton: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   saveButton: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   cardCounter: {
//     color: '#fff',
//     fontSize: 14,
//   },
//   cardContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   flashcard: {
//     backgroundColor: '#fff',
//     padding: 30,
//     borderRadius: 12,
//     minHeight: 200,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   cardLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 10,
//     fontWeight: 'bold',
//   },
//   cardText: {
//     fontSize: 18,
//     textAlign: 'center',
//     color: '#333',
//   },
//   flipButton: {
//     backgroundColor: '#6366f1',
//     padding: 15,
//     borderRadius: 8,
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   navigation: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 20,
//   },
//   navButton: {
//     backgroundColor: '#10b981',
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   disabledButton: {
//     backgroundColor: '#ccc',
//   },
//   navButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   editContent: {
//     flex: 1,
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   flashcardItem: {
//     backgroundColor: '#fff',
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   flashcardQuestion: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#333',
//   },
//   flashcardAnswer: {
//     fontSize: 14,
//     color: '#666',
//   },
//   difficultyButtons: {
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   difficultyLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#333',
//   },
//   difficultyButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 8,
//     marginBottom: 10,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   easyButton: {
//     backgroundColor: '#10b981',
//   },
//   mediumButton: {
//     backgroundColor: '#f59e0b',
//   },
//   hardButton: {
//     backgroundColor: '#ef4444',
//   },
//   difficultyButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   methodSelector: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   methodButton: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//     backgroundColor: '#e5e7eb',
//     marginHorizontal: 2,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   activeMethod: {
//     backgroundColor: '#6366f1',
//   },
//   methodText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   textArea: {
//     minHeight: 100,
//   },
//   messagesList: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   messagesContent: {
//     paddingVertical: 16,
//   },
//   messageContainer: {
//     marginBottom: 12,
//     padding: 12,
//     borderRadius: 12,
//     maxWidth: '80%',
//   },
//   userMessage: {
//     backgroundColor: '#6366f1',
//     alignSelf: 'flex-end',
//   },
//   aiMessage: {
//     backgroundColor: '#f3f4f6',
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 4,
//   },
//   messageTime: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'right',
//   },
//   loadingContainer: {
//     padding: 16,
//     alignItems: 'center',
//   },
//   loadingText: {
//     fontSize: 14,
//     color: '#666',
//     fontStyle: 'italic',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#e5e7eb',
//     alignItems: 'flex-end',
//   },
//   messageInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     marginRight: 12,
//     maxHeight: 100,
//     fontSize: 16,
//   },
//   sendButton: {
//     backgroundColor: '#6366f1',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 20,
//   },
//   sendButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   roomsList: {
//     padding: 16,
//   },
//   roomCard: {
//     backgroundColor: '#fff',
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   roomName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   roomDescription: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   roomMeta: {
//     fontSize: 12,
//     color: '#888',
//     marginBottom: 12,
//   },
//   joinButton: {
//     backgroundColor: '#10b981',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   joinButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   modalOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 12,
//     width: '90%',
//     maxWidth: 400,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#333',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//   },
//   modalButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     marginHorizontal: 5,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#e5e7eb',
//   },
//   cancelButtonText: {
//     color: '#374151',
//     fontWeight: 'bold',
//   },
//   createModalButton: {
//     backgroundColor: '#6366f1',
//   },
//   createModalButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   senderName: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#666',
//     marginBottom: 4,
//   },
//   engagementContent: {
//     flex: 1,
//     padding: 16,
//   },
//   statsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: 24,
//   },
//   statCard: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 12,
//     width: '48%',
//     marginBottom: 12,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   statIcon: {
//     fontSize: 24,
//     marginBottom: 8,
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#6366f1',
//     marginBottom: 4,
//   },
//   statTitle: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//   },
//   sessionCard: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sessionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   sessionSubject: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   sessionStatus: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   completed: {
//     backgroundColor: '#dcfce7',
//     color: '#166534',
//   },
//   incomplete: {
//     backgroundColor: '#fef3c7',
//     color: '#92400e',
//   },
//   sessionDate: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   sessionDuration: {
//     fontSize: 14,
//     color: '#666',
//   },
//   motivationCard: {
//     backgroundColor: '#6366f1',
//     padding: 20,
//     borderRadius: 12,
//     marginTop: 16,
//     alignItems: 'center',
//   },
//   motivationTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 8,
//   },
//   motivationText: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   emptyState: {
//     alignItems: 'center',
//     padding: 32,
//   },
//   emptyText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#666',
//     marginBottom: 8,
//   },
//   activityChart: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   activityItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   activityDate: {
//     fontSize: 12,
//     color: '#666',
//     width: 80,
//   },
//   activityBar: {
//     flex: 1,
//     height: 8,
//     backgroundColor: '#e5e7eb',
//     borderRadius: 4,
//     marginHorizontal: 12,
//   },
//   activityFill: {
//     height: '100%',
//     backgroundColor: '#6366f1',
//     borderRadius: 4,
//   },
//   activityCount: {
//     fontSize: 12,
//     color: '#333',
//     width: 30,
//     textAlign: 'right',
//   },
// });

// export default App;