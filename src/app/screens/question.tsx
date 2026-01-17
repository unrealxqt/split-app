import {
  SafeAreaView,
  View,
  Text,
  Animated,
  BackHandler,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect } from 'react'
import { useApp } from '@/context/app-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHaptic } from '@/context/haptic-context'
import { useQuestionQueue } from '@/hooks/use-question'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { theme } from '@/constants/theme'
import { QuestionOptions } from '../question-options'

export default function QuestionScreen() {
  const { state, dispatch } = useApp()
  const { enabled: hapticEnabled } = useHaptic()
  const { question, fadeAnim, advance } = useQuestionQueue(
    state.deviceUuid
  )
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ advance?: string }>()

  useEffect(() => {
    if (params.advance === '1') {
      advance()
    }
  }, [params.advance])

  const handleBackPress = useCallback(() => {
    router.replace('/screens/menu')
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
      router.replace({
        pathname: '/screens/result',
        params: {
          question: JSON.stringify(question),
          selectedOption: option,
        },
      })
    }
  }

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
            {question && question.question_text}
          </Text>
        </View>

        <QuestionOptions
          optionA={question?.option_a ?? ''}
          optionB={question?.option_b ?? ''}
          onVote={handleVote}
        />
      </Animated.View>
    </SafeAreaView>
  )
}
