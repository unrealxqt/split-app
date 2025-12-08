import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  SafeAreaView,
  BackHandler,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import type { Question } from '@/types'
import { LoadingSpinner } from '@/components/loading-spinner'
import { theme } from '@/constants/theme'
import { useApp } from '@/context/app-context'
import { getNextQuestion } from '@/services/api'
import { ErrorState } from '@/components/error-state'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Sentry from '@sentry/react-native'
import { usePostHog } from 'posthog-react-native'
import * as Haptics from 'expo-haptics'
import { useHaptic } from '@/context/haptic-context'

export default function QuestionScreen() {
  const { enabled: hapticEnabled } = useHaptic()

  const router = useRouter()
  const posthog = usePostHog()
  const { state } = useApp()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const insets = useSafeAreaInsets()
  const [streak, setStreak] = useState(0)
  const fadeAnim = useRef(new Animated.Value(0)).current

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

  const fetchQuestion = async () => {
    if (!state.deviceUuid) {
      setError('Device not initialized')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    fadeAnim.setValue(0)

    try {
      const nextQuestion = await getNextQuestion(state.deviceUuid)
      if (!nextQuestion) {
        setQuestion(null)
      } else {
        setQuestion(nextQuestion)
        posthog.capture('question_displayed')
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start()
      }
    } catch (err) {
      console.error('Failed to fetch question:', err)
      Sentry.captureException(err)
      setError('Failed to load question. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!state.deviceUuid) return
    fetchQuestion()
  }, [state.deviceUuid])

  const handleVote = (option: 'A' | 'B') => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    setStreak(streak + 1)

    router.push({
      pathname: '/result',
      params: {
        questionId: question?.question_id,
        questionText: question?.question_text,
        optionA: question?.option_a,
        optionB: question?.option_b,
        selectedOption: option,
        streak,
      },
    })
  }

  const handleViewHistory = () => {
    router.push('/history')
  }

  if (loading) return <LoadingSpinner />

  if (error) return <ErrorState message={error} onRetry={fetchQuestion} />

  if (!question) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>All Done! 🎉</Text>
          <Text style={styles.emptySubtitle}>
            All answers have been submitted. Thank you for participating!
          </Text>
          <Pressable style={styles.bigButton} onPress={handleViewHistory}>
            <Text style={styles.bigButtonText}>View History</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
          paddingBottom: insets.bottom + 16,
        }}>
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>🔥 Streak: {streak}</Text>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question_text}</Text>
        </View>

        <View style={styles.optionsWrapper}>
          <Pressable
            style={({ pressed }) => [
              styles.optionContainer,
              pressed && {
                transform: [{ scale: 0.96 }],
                backgroundColor: '#e0e0e0',
              },
            ]}
            onPress={() => handleVote('A')}>
            <Text style={styles.optionText}>{question.option_a}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.optionContainer,
              pressed && {
                transform: [{ scale: 0.96 }],
                backgroundColor: '#e0e0e0',
              },
            ]}
            onPress={() => handleVote('B')}>
            <Text style={styles.optionText}>{question.option_b}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.black },
  streakContainer: { padding: theme.spacing.md, alignItems: 'center' },
  streakText: { fontSize: 18, fontWeight: '600', color: '#FFD700' },
  questionContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  questionText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 36,
  },
  optionsWrapper: {
    flex: 3,
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
  },
  optionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  optionText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.black,
    textAlign: 'center',
    paddingHorizontal: 16,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 18,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  bigButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 32,
  },
  bigButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.black,
    textAlign: 'center',
  },
})
