// src/screens/submit-question.tsx
import React, { useState } from 'react'
import {
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { submitQuestion } from '@/services/api'
import { useApp } from '@/context/app-context'
import { theme } from '@/constants/theme'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function SubmitQuestionScreen() {
  const { state } = useApp()
  const [questionText, setQuestionText] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
      Alert.alert('Missing fields', 'Please fill all fields before submitting.')
      return
    }

    setLoading(true)
    try {
      await submitQuestion(state.deviceUuid!, questionText, optionA, optionB)
      Alert.alert(
        'Submitted!',
        'Your question has been submitted for review. Thank you!',
        [{ text: 'OK', onPress: () => {
          setQuestionText('')
          setOptionA('')
          setOptionB('')
        }}]
      )
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.black }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.white, marginBottom: 24 }}>
            Submit a Question
          </Text>

          <Text style={{ color: theme.colors.gray, marginBottom: 8 }}>Question:</Text>
          <TextInput
            value={questionText}
            onChangeText={setQuestionText}
            placeholder="Enter your question"
            placeholderTextColor="#888"
            style={{
              backgroundColor: '#222',
              color: '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              fontSize: 16,
            }}
            multiline
          />

          <Text style={{ color: theme.colors.gray, marginBottom: 8 }}>Option A:</Text>
          <TextInput
            value={optionA}
            onChangeText={setOptionA}
            placeholder="Option A"
            placeholderTextColor="#888"
            style={{
              backgroundColor: '#222',
              color: '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              fontSize: 16,
            }}
          />

          <Text style={{ color: theme.colors.gray, marginBottom: 8 }}>Option B:</Text>
          <TextInput
            value={optionB}
            onChangeText={setOptionB}
            placeholder="Option B"
            placeholderTextColor="#888"
            style={{
              backgroundColor: '#222',
              color: '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 32,
              fontSize: 16,
            }}
          />

          {loading ? (
            <LoadingSpinner />
          ) : (
            <Pressable
              onPress={handleSubmit}
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 32,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowOffset: { width: 0, height: 6 },
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.black }}>
                Submit Question
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
