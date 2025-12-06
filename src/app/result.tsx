import { View, Text, StyleSheet, Animated, Button, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import type { VoteResult } from '@/types';
import { ErrorState } from '@/components/error-state';
import { LoadingSpinner } from '@/components/loading-spinner';
import { theme } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { submitVote } from '@/services/api';
import { PercentageBar } from '@/components/percentage-bar';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    questionId: string;
    questionText: string;
    optionA: string;
    optionB: string;
    selectedOption: 'A' | 'B';
  }>();

  const { state } = useApp();
  const [result, setResult] = useState<VoteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { questionId, selectedOption, optionA, optionB, questionText } = params;

  const handleBackPress = () => {
    router.replace('/menu')
    return true
  }

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      )
      return () => subscription.remove()
    }, [])
  )

  useEffect(() => {
    if (hasSubmitted) return;
    if (!state.deviceUuid || !questionId || !selectedOption) {
      setError('Invalid vote data');
      setLoading(false);
      return;
    }

    async function submitAndFetchResults() {
      setLoading(true);
      setError(null);

      try {
        const voteResult = await submitVote(
          state.deviceUuid,
          questionId,
          selectedOption
        );
        setResult(voteResult);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
        setHasSubmitted(true);
      } catch (err: any) {
        console.error('Vote failed:', err);
        setError(err.message || 'Failed to submit vote');
      } finally {
        setLoading(false);
      }
    }

    submitAndFetchResults();
  }, [state.deviceUuid, questionId, selectedOption, hasSubmitted]);

  const handleNext = () => {
    router.push('/question');
  };

  const handleRetry = () => {
    setHasSubmitted(false);
    setLoading(true);
    setError(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Submitting your vote...</Text>
      </View>
    );
  }

  if (error || !result) {
    return (
      <View style={styles.container}>
        <ErrorState message={error || 'Vote submission failed'} onRetry={handleRetry} />
      </View>
    );
  }

  const isOptionASelected = selectedOption === 'A';

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText} numberOfLines={2}>
            {questionText}
          </Text>
        </View>

        <View style={styles.resultsContainer}>
          <View style={[styles.resultCard, isOptionASelected && styles.selectedCard]}>
            <View style={styles.resultHeader}>
              <Text style={styles.optionText}>{optionA}</Text>
              {isOptionASelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.percentageText}>{result.option_a_percentage.toFixed(0)}%</Text>
            <PercentageBar percentage={result.option_a_percentage} animated />
            <Text style={styles.voteCount}>{result.option_a_votes.toLocaleString()} votes</Text>
          </View>

          <View style={[styles.resultCard, !isOptionASelected && styles.selectedCard]}>
            <View style={styles.resultHeader}>
              <Text style={styles.optionText}>{optionB}</Text>
              {!isOptionASelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.percentageText}>{result.option_b_percentage.toFixed(0)}%</Text>
            <PercentageBar percentage={result.option_b_percentage} animated />
            <Text style={styles.voteCount}>{result.option_b_votes.toLocaleString()} votes</Text>
          </View>

          <Text style={styles.totalVotes}>{result.total_votes.toLocaleString()} total votes</Text>
        </View>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button title="Next Question" onPress={handleNext} />
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
    padding: theme.spacing.lg,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 28,
  },
  resultsContainer: {
    gap: theme.spacing.lg,
  },
  resultCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: theme.colors.black,
    borderWidth: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.black,
    flex: 1,
  },
  checkmark: {
    fontSize: 24,
    color: theme.colors.black,
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  voteCount: {
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  totalVotes: {
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
