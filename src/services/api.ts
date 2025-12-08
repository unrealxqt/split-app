// src/services/api.ts
import { supabase } from './supabase';
import type { Question, VoteResult, VoteHistoryItem } from '../types';

// Re-export types
export type { Question, VoteResult, VoteHistoryItem };

export async function registerDevice(deviceUuid: string): Promise<void> {
  const { error } = await supabase.rpc('register_device', {
    p_device_uuid: deviceUuid,
  });
  if (error) throw error;
}

export async function getNextQuestion(deviceUuid: string): Promise<Question | null> {
  const { data, error } = await supabase.rpc('get_next_question', {
    p_device_uuid: deviceUuid,
  });
  if (error) throw error;
  return data?.[0] || null;
}

export async function submitVote(
  deviceUuid: string,
  questionId: string,
  selectedOption: 'A' | 'B'
): Promise<VoteResult> {
  const { data, error } = await supabase.rpc('submit_vote_and_get_results_v2', {
    p_device_uuid: deviceUuid,
    p_question_id: questionId,
    p_selected_option: selectedOption,
  });
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No data returned from vote submission');
  }
  return data[0];
}

export async function getVoteHistory(deviceUuid: string): Promise<VoteHistoryItem[]> {
  const { data, error } = await supabase.rpc('get_vote_history', {
    p_device_uuid: deviceUuid,
  });
  if (error) throw error;
  return data || [];
}

export async function setHapticFeedback(deviceUuid: string, enabled: boolean) {
  const { error } = await supabase.rpc('set_haptic_feedback', {
    p_device_uuid: deviceUuid,
    p_enabled: enabled,
  });
  if (error) throw error;
}

export async function getDeviceSettings(deviceUuid: string) {
  const { data, error } = await supabase
    .from('device_ids')
    .select('haptic_enabled')
    .eq('device_uuid', deviceUuid)
    .single();
  if (error) throw error;
  return data?.haptic_enabled ?? true;
}
