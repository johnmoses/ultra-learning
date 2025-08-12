import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';
import { authAPI, dashboardAPI } from '../services/api';
import { DashboardStats } from '../types';

const ProfileScreen = ({ navigation }: any) => {

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.logout();
            } catch (error) {
              console.log('Logout error:', error);
            } finally {
              navigation.replace('Auth');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.centerContent}>
              <Text style={styles.welcomeText}>Profile</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Title style={styles.statNumber}>{stats.total_users}</Title>
                <Paragraph>Total Users</Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <Title style={styles.statNumber}>{stats.total_learning_packs}</Title>
                <Paragraph>Learning Packs</Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <Title style={styles.statNumber}>{stats.total_chat_messages}</Title>
                <Paragraph>Chat Messages</Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <Title style={styles.statNumber}>{stats.active_sessions}</Title>
                <Paragraph>Active Sessions</Paragraph>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;