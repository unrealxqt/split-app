import { useState, useEffect } from 'react';
import { getNextQuestion } from '../services/api';
import type { Question } from '../services/api';

export function useQuestion(deviceUuid: string | null) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    if (!deviceUuid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const nextQuestion = await getNextQuestion(deviceUuid);
      setQuestion(nextQuestion);
    } catch (err) {
      setError('Failed to load question');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [deviceUuid]);

  return { question, loading, error, refetch: fetchQuestion };
}