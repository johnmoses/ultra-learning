import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { dashboardAPI } from '../services/api';
import { Button, Card, Paragraph, ProgressBar, Title } from 'react-native-paper';

const { width } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  description: string;
  earned_at: string;
}

interface EngagementMetrics {
  total_points: number;
  streak_days: number;
  time_spent_today: number;
  weekly_activity: { day: string; points: number }[];
  category_breakdown: { category: string; points: number }[];
  achievements: Achievement[];
}

const HomeScreen = () => {
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    total_points: 0,
    streak_days: 0,
    time_spent_today: 0,
    weekly_activity: [],
    category_breakdown: [],
    achievements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getOverview();
      setMetrics({ ...data, achievements: data.achievements || [] });
    } catch (err) {
      console.error('Failed to fetch engagement data:', err);
      setError('Failed to load engagement data. Please try again.');
      Alert.alert('Error', 'Failed to load engagement data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const dailyGoal = 60; // minutes, hardcoded for now
  const completedToday = metrics?.time_spent_today || 0;
  const progressPercentage = completedToday / dailyGoal;

  const MetricCard = ({ title, value, subtitle, color = '#6366f1' }: any) => (
    <Card style={[styles.metricCard, { width: (width - 48) / 2 }]}>
      <Card.Content>
        <Title style={[styles.metricValue, { color }]}>{value}</Title>
        <Paragraph style={styles.metricTitle}>{title}</Paragraph>
        {subtitle && <Paragraph style={styles.metricSubtitle}>{subtitle}</Paragraph>}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Loading engagement data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchEngagementData}>Retry</Button>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No engagement data available.</Text>
        <Button mode="contained" onPress={fetchEngagementData}>Load Data</Button>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.centerContent}>
              <Text style={styles.welcomeText}>Welcome to UltraLearning</Text>
            </View>
          </View>
        </View>
        <Card style={styles.progressCard}>
          <Card.Content>
            <Title>Daily Learning Goal</Title>
            <View style={styles.progressContainer}>
              <Paragraph style={styles.progressText}>
                {completedToday} / {dailyGoal} minutes
              </Paragraph>
              <ProgressBar
                progress={progressPercentage}
                color="#6366f1"
                style={styles.progressBar}
              />
              <Paragraph style={styles.progressPercentage}>
                {Math.round(progressPercentage * 100)}% Complete
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.metricsContainer}>
          <MetricCard
            title="Total Points"
            value={metrics.total_points}
            color="#6366f1"
          />
          <MetricCard
            title="Current Streak"
            value={`${metrics.streak_days} days`}
            color="#10b981"
          />

          <MetricCard
            title="Time Spent Today"
            value={`${metrics.time_spent_today}m`}
            color="#f59e0b"
          />

          <MetricCard
            title="Total Achievements"
            value={metrics.achievements.length}
            color="#8b5cf6"
          />
        </View>

        <Card style={styles.achievementsCard}>
          <Card.Content>
            <Title>Recent Achievements</Title>
            {(metrics.achievements || []).map((achievement) => (
              <View key={achievement.id} style={styles.achievement}>
                <Paragraph style={styles.achievementTitle}>{achievement.title}</Paragraph>
                <Paragraph style={styles.achievementDesc}>{achievement.description}</Paragraph>
                <Paragraph style={styles.achievementDate}>Earned: {new Date(achievement.earned_at).toLocaleDateString()}</Paragraph>
              </View>
            ))}
            {(!metrics.achievements || metrics.achievements.length === 0) && (
              <Text style={styles.emptyText}>No achievements yet.</Text>
            )}
          </Card.Content>
        </Card>

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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressPercentage: {
    textAlign: 'center',
    color: '#6366f1',
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metricTitle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricSubtitle: {
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
  },
  achievementsCard: {
    marginBottom: 16,
  },
  achievement: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  achievementTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  achievementDesc: {
    color: '#6b7280',
    fontSize: 14,
  },
  achievementDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#6b7280',
  },
});

export default HomeScreen;