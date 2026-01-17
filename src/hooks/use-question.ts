import { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { getNextQuestion } from '../services/api'
import type { Question } from '../services/api'
import * as Sentry from '@sentry/react-native'
import { usePostHog } from 'posthog-react-native'

export function useQuestionQueue(deviceUuid: string | null) {
  const [current, setCurrent] = useState<Question | null>(null)
  const [next, setNext] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const posthog = usePostHog()

  const animateIn = () => {
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start()
  }

  const preloadNext = async () => {
    if (!deviceUuid) return
    try {
      const q = await getNextQuestion(deviceUuid)
      setNext(q)
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  const loadInitial = async () => {
    if (!deviceUuid) return
    setLoading(true)
    setError(null)

    try {
      const first = await getNextQuestion(deviceUuid)
      const second = await getNextQuestion(deviceUuid)

      setCurrent(first)
      setNext(second)

      if (first) {
        posthog.capture('question_displayed')
        animateIn()
      }
    } catch (e) {
      Sentry.captureException(e)
      setError('Failed to load question')
    } finally {
      setLoading(false)
    }
  }

  const advance = () => {
    if (!next) return
    setCurrent(next)
    setNext(null)
    posthog.capture('question_displayed')
    animateIn()
    preloadNext()
  }


  useEffect(() => {
    loadInitial()
  }, [deviceUuid])

  return {
    question: current,
    loading,
    error,
    fadeAnim,
    advance,
  }
}
