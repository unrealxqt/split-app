import { useState, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { getNextQuestion } from '../services/api'
import type { Question } from '../services/api'
import * as Sentry from '@sentry/react-native'
import { usePostHog } from 'posthog-react-native'

export function useQuestionWithAnimation(deviceUuid: string | null) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const posthog = usePostHog()

  const fetchQuestion = async () => {
    if (!deviceUuid) return

    setLoading(true)
    setError(null)
    fadeAnim.setValue(0)

    try {
      const nextQuestion = await getNextQuestion(deviceUuid)
      setQuestion(nextQuestion)
      if (nextQuestion) {
        posthog.capture('question_displayed')
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start()
      }
    } catch (err) {
      console.error(err)
      Sentry.captureException(err)
      setError('Failed to load question. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestion()
  }, [deviceUuid])

  return { question, loading, error, fetchQuestion, fadeAnim }
}
