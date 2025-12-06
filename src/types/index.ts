// src/types/index.ts
export interface Question {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
}

export interface VoteResult {
  question_id: string;
  total_votes: number;
  option_a_votes: number;
  option_b_votes: number;
  option_a_percentage: number;
  option_b_percentage: number;
}

export interface VoteHistoryItem {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  selected_option: 'A' | 'B';
  voted_at: string;
}
