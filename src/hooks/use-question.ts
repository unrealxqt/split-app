import { useEffect, useRef, useState, useCallback } from 'react'
import { Animated, AppState } from 'react-native'
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
  const appState = useRef(AppState.currentState)
  const questionIndex = useRef(0)

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
        questionIndex.current = 0
        posthog.capture('question_displayed', {
          question_id: first.question_id,
          question_index: questionIndex.current,
          deviceUuid,
          timestamp: Date.now(),
        })
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
    questionIndex.current += 1
    posthog.capture('question_displayed', {
      question_id: next?.question_id,
      question_index: questionIndex.current,
      deviceUuid,
      timestamp: Date.now(),
    })
    animateIn()
    preloadNext()
  }

  const reportQuestionLeft = useCallback(() => {
    if (!current || !deviceUuid) return
    posthog.capture('question_left', {
      question_id: current.question_id,
      question_index: questionIndex.current,
      deviceUuid,
      timestamp: Date.now(),
    })
  }, [current, deviceUuid, posthog])

  useEffect(() => {
    loadInitial()
  }, [deviceUuid])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        reportQuestionLeft()
      }
      appState.current = nextAppState
    })
    return () => subscription.remove()
  }, [reportQuestionLeft])

  return {
    question: current,
    loading,
    error,
    fadeAnim,
    advance,
    reportQuestionLeft,
    questionIndex: questionIndex.current,
  }
}
