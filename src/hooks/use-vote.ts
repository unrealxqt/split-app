import { useState } from 'react';
import { submitVote } from '../services/api';
import type { VoteResult } from '../services/api';

export function useVote() {
  const [result, setResult] = useState<VoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vote = async (deviceUuid: string, questionId: string, option: 'A' | 'B') => {
    setLoading(true);
    setError(null);
    
    try {
      const voteResult = await submitVote(deviceUuid, questionId, option);
      setResult(voteResult);
      return voteResult;
    } catch (err) {
      setError('Failed to submit vote');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { vote, result, loading, error };
}
