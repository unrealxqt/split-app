import React, { useEffect, useRef, useState } from 'react'
import { View, Animated, BackHandler } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Sentry from '@sentry/react-native'
import { usePostHog } from 'posthog-react-native'

import { useApp } from '@/context/app-context'
import { submitVote } from '@/services/api'
import { useInterstitialAd } from '@/services/interstitial-ad'
import type { Question, VoteResult } from '@/types'
import { theme } from '@/constants/theme'

import ResultHeader from '@/components/result-header'
import ResultCard from '@/components/result-card'
import ResultFooter from '@/components/result-footer'
import LoadingScreen from '@/components/loading-screen'
import ErrorScreen from '@/components/error-screen'

type ResultParams = {
  question: string
  selectedOption: 'A' | 'B'
  streak: string
  advance?: '1'
}

export default function ResultScreen() {
  const router = useRouter()
  const posthog = usePostHog()
  const { state } = useApp()
  const params = useLocalSearchParams<ResultParams>()
  const selectedOption = params.selectedOption
  const { showAd } = useInterstitialAd()
  const insets = useSafeAreaInsets()

  let question: Question | null = null
  try {
    question = params.question ? JSON.parse(params.question) : null
  } catch (err) {
    Sentry.captureException(err)
  }

  const [result, setResult] = useState<VoteResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useFocusEffect(
    React.useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        router.replace('/screens/menu')
        return true
      })
      return () => sub.remove()
    }, [])
  )

  useEffect(() => {
    if (hasSubmitted || !state.deviceUuid || !question || !selectedOption) {
      if (!question || !selectedOption) setError('Invalid vote data')
      setLoading(false)
      return
    }

    async function submitAndFetch() {
      setLoading(true)
      setError(null)
      try {
        const voteResult = await submitVote(state.deviceUuid, question!.question_id, selectedOption)
        posthog.capture('answered_question', {
          question_id: question.question_id,
          choice: selectedOption,
          timestamp: Date.now(),
        })
        setResult(voteResult)
        setHasSubmitted(true)
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
      } catch (err: any) {
        Sentry.captureException(err)
        setError(err.message || 'Failed to submit vote')
      } finally {
        setLoading(false)
      }
    }

    submitAndFetch()
  }, [state.deviceUuid, question, selectedOption, hasSubmitted, fadeAnim, posthog])

  const handleNext = () => {
    showAd()
    router.replace({ pathname: '/screens/question', params: { advance: '1' } })
  }

  const handleRetry = () => {
    setHasSubmitted(false)
    setLoading(true)
    setError(null)
  }

  if (loading) return <LoadingScreen message="Submitting your vote..." />
  if (error || !result) return <ErrorScreen message={error || 'Vote submission failed'} onRetry={handleRetry} />

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.black }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, padding: 16 }}>
        <ResultHeader questionText={question?.question_text || 'Unknown question'} />
        <ResultCard
          option={question?.option_a || 'Option A'}
          votes={result.option_a_votes}
          percentage={result.option_a_percentage}
          selected={selectedOption === 'A'}
        />
        <ResultCard
          option={question?.option_b || 'Option B'}
          votes={result.option_b_votes}
          percentage={result.option_b_percentage}
          selected={selectedOption === 'B'}
        />
      </Animated.View>

      <ResultFooter totalVotes={result.total_votes} onNext={handleNext} insets={insets} />
    </View>
  )
}
