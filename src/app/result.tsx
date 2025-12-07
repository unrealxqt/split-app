import {
  View,
  Text,
  StyleSheet,
  Animated,
  BackHandler,
  Pressable,
} from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import type { VoteResult } from '@/types'
import { ErrorState } from '@/components/error-state'
import { LoadingSpinner } from '@/components/loading-spinner'
import { theme } from '@/constants/theme'
import { useApp } from '@/context/app-context'
import { submitVote } from '@/services/api'
import { PercentageBar } from '@/components/percentage-bar'
import { usePostHog } from 'posthog-react-native'

export default function ResultScreen() {
  const router = useRouter()
  const posthog = usePostHog()
  const params = useLocalSearchParams<{
    questionId: string
    questionText: string
    optionA: string
    optionB: string
    selectedOption: 'A' | 'B'
  }>()

  const { state } = useApp()
  const [result, setResult] = useState<VoteResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current

  const { questionId, selectedOption, optionA, optionB, questionText } = params

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
    if (hasSubmitted) return
    if (!state.deviceUuid || !questionId || !selectedOption) {
      setError('Invalid vote data')
      setLoading(false)
      return
    }

    async function submitAndFetchResults() {
      setLoading(true)
      setError(null)

      try {
        const voteResult = await submitVote(
          state.deviceUuid,
          questionId,
          selectedOption
        )
        posthog.capture('answered_question', {
          question_id: questionId,
          choice: selectedOption,
          timestamp: Date.now(),
        })
        setResult(voteResult)
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start()
        setHasSubmitted(true)
      } catch (err: any) {
        setError(err.message || 'Failed to submit vote')
      } finally {
        setLoading(false)
      }
    }

    submitAndFetchResults()
  }, [state.deviceUuid, questionId, selectedOption, hasSubmitted])

  const handleNext = () => {
    router.push('/question')
  }

  const handleRetry = () => {
    setHasSubmitted(false)
    setLoading(true)
    setError(null)
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Submitting your vote...</Text>
      </View>
    )
  }

  if (error || !result) {
    return (
      <View style={styles.container}>
        <ErrorState
          message={error || 'Vote submission failed'}
          onRetry={handleRetry}
        />
      </View>
    )
  }

  const isOptionASelected = selectedOption === 'A'

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText} numberOfLines={2}>
            {questionText}
          </Text>
        </View>

        <View style={styles.resultsContainer}>
          <Animated.View
            style={[
              styles.resultCard,
              isOptionASelected ? styles.selectedCard : styles.unselectedCard,
            ]}>
            <View style={styles.resultHeader}>
              <Text style={styles.optionText}>{optionA}</Text>
            </View>
            <Text style={styles.percentageText}>
              {result.option_a_percentage.toFixed(0)}%
            </Text>
            <PercentageBar percentage={result.option_a_percentage} animated />
            {result.option_a_votes >= 1000 && (
              <Text style={styles.voteCount}>
                {result.option_a_votes.toLocaleString()} votes
              </Text>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.resultCard,
              !isOptionASelected ? styles.selectedCard : styles.unselectedCard,
            ]}>
            <View style={styles.resultHeader}>
              <Text style={styles.optionText}>{optionB}</Text>
            </View>
            <Text style={styles.percentageText}>
              {result.option_b_percentage.toFixed(0)}%
            </Text>
            <PercentageBar percentage={result.option_b_percentage} animated />
            {result.option_b_votes >= 1000 && (
              <Text style={styles.voteCount}>
                {result.option_b_votes.toLocaleString()} votes
              </Text>
            )}
          </Animated.View>

          {result.total_votes >= 1000 && (
            <Text style={styles.totalVotes}>
              {result.total_votes.toLocaleString()} total votes
            </Text>
          )}
        </View>
      </Animated.View>

      <View style={styles.nextButtonWrapper}>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next Question</Text>
        </Pressable>
      </View>
    </View>
  )
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
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#3B82F6',
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  unselectedCard: {
    transform: [{ scale: 0.96 }],
    opacity: 0.75,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.black,
    flex: 1,
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
  nextButtonWrapper: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.black,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#222',
  },
  nextButton: {
    backgroundColor: theme.colors.white,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.black,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
})
