import {
  SafeAreaView,
  View,
  Text,
  Animated,
  Pressable,
  BackHandler,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback } from 'react'
import { useApp } from '@/context/app-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHaptic } from '@/context/haptic-context'
import { useQuestionWithAnimation } from '@/hooks/use-question'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ErrorState } from '@/components/error-state'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { theme } from '@/constants/theme'
import { QuestionOptions } from './question-options'

export default function QuestionScreen() {
  const { state, dispatch } = useApp()
  const { enabled: hapticEnabled } = useHaptic()
  const { question, loading, error, fetchQuestion, fadeAnim } =
    useQuestionWithAnimation(state.deviceUuid)
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleBackPress = useCallback(() => {
    router.replace('/menu')
    return true
  }, [])
  useFocusEffect(() => {
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    )
    return () => sub.remove()
  })

  const handleVote = (option: 'A' | 'B') => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    dispatch({ type: 'INCREMENT_STREAK' })

    if (question && state.deviceUuid) {
      router.push({
        pathname: '/result',
        params: {
          question: JSON.stringify(question),
          selectedOption: option,
        },
      })
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={fetchQuestion} />
  if (!question)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: theme.colors.white,
          }}>
          All Done! 🎉
        </Text>
        <Pressable
          onPress={() => router.push('/history')}
          style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 24, color: theme.colors.white }}>
            View History
          </Text>
        </Pressable>
      </View>
    )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.black }}>
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
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFD700' }}>
            🔥 Streak: {state.streak}
          </Text>
        </View>

        <View
          style={{
            flex: 2,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: theme.colors.white,
              textAlign: 'center',
            }}>
            {question.question_text}
          </Text>
        </View>

        <QuestionOptions
          optionA={question.option_a}
          optionB={question.option_b}
          onVote={handleVote}
        />
      </Animated.View>
    </SafeAreaView>
  )
}
