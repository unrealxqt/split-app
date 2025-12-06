import { View, Text, StyleSheet, Animated, Button } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import type { Question } from '@/types';
import { LoadingSpinner } from '@/components/loading-spinner'
import { theme } from '@/constants/theme'
import { useApp } from '@/context/app-context'
import { getNextQuestion } from '@/services/api'
import { ErrorState } from '@/components/error-state'

export default function QuestionScreen() {
  const router = useRouter();
  const { state } = useApp();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchQuestion = async () => {
    if (!state.deviceUuid) {
      setError('Device not initialized');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fadeAnim.setValue(0);

    try {
      const nextQuestion = await getNextQuestion(state.deviceUuid);
      
      if (!nextQuestion) {
        setQuestion(null);
      } else {
        setQuestion(nextQuestion);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } catch (err) {
      console.error('Failed to fetch question:', err);
      setError('Failed to load question. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [state.deviceUuid]);

  const handleVote = (option: 'A' | 'B') => {
    if (!question || submitting) return;

    router.push({
      pathname: '/result',
      params: {
        questionId: question.question_id,
        questionText: question.question_text,
        optionA: question.option_a,
        optionB: question.option_b,
        selectedOption: option,
      },
    });
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={fetchQuestion} />
      </View>
    );
  }

  // No more questions
  if (!question) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>All Done! 🎉</Text>
          <Text style={styles.emptySubtitle}>
            All answers have been submitted. Thank you for participating!
          </Text>
          <Button title="View Your History" onPress={handleViewHistory} />
        </View>
      </View>
    );
  }

  // Main question screen
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText} numberOfLines={2}>
            {question.question_text}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <Button
            title={question.option_a}
            onPress={() => handleVote('A')}
            variant="primary"
            style={styles.optionButton}
          />
          <Button
            title={question.option_b}
            onPress={() => handleVote('B')}
            variant="primary"
            style={styles.optionButton}
          />
        </View>
      </Animated.View>

      {/* Settings button top-right */}
      <View style={styles.settingsContainer}>
        <Button
          title="⚙️"
          onPress={() => router.push('/settings')}
          variant="minimal"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl * 2,
  },
  questionText: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 36,
  },
  optionsContainer: {
    gap: theme.spacing.lg,
  },
  optionButton: {
    minHeight: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 18,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  settingsContainer: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.lg,
  },
});
