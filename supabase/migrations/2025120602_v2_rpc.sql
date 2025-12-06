-- Migration 002: RPC Functions
-- File: supabase/migrations/20250101000001_rpc_functions.sql

-- Register device (idempotent)
CREATE OR REPLACE FUNCTION register_device(p_device_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO device_ids (device_uuid, created_at, last_seen)
  VALUES (p_device_uuid, NOW(), NOW())
  ON CONFLICT (device_uuid) 
  DO UPDATE SET last_seen = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get next unanswered question
CREATE OR REPLACE FUNCTION get_next_question(p_device_uuid UUID)
RETURNS TABLE (
  question_id UUID,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.question_text, q.option_a, q.option_b
  FROM questions q
  WHERE q.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM votes v 
      WHERE v.question_id = q.id 
      AND v.device_uuid = p_device_uuid
    )
  ORDER BY q.created_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit vote and get results (atomic operation)
CREATE OR REPLACE FUNCTION submit_vote_and_get_results(
  p_device_uuid UUID,
  p_question_id UUID,
  p_selected_option TEXT
)
RETURNS TABLE (
  question_id UUID,
  total_votes BIGINT,
  option_a_votes BIGINT,
  option_b_votes BIGINT,
  option_a_percentage NUMERIC(5,2),
  option_b_percentage NUMERIC(5,2)
) AS $$
DECLARE
  v_total_votes BIGINT;
  v_option_a_votes BIGINT;
  v_option_b_votes BIGINT;
BEGIN
  -- Insert vote
  INSERT INTO votes (device_uuid, question_id, selected_option)
  VALUES (p_device_uuid, p_question_id, p_selected_option)
  ON CONFLICT (device_uuid, question_id) DO NOTHING;
  
  -- Calculate stats
  SELECT COUNT(*) INTO v_total_votes
  FROM votes WHERE votes.question_id = p_question_id;
  
  SELECT COUNT(*) INTO v_option_a_votes
  FROM votes 
  WHERE votes.question_id = p_question_id 
  AND selected_option = 'A';
  
  v_option_b_votes := v_total_votes - v_option_a_votes;
  
  -- Return results
  RETURN QUERY
  SELECT 
    p_question_id,
    v_total_votes,
    v_option_a_votes,
    v_option_b_votes,
    CASE WHEN v_total_votes > 0 THEN ROUND((v_option_a_votes::NUMERIC / v_total_votes * 100), 2) ELSE 0 END,
    CASE WHEN v_total_votes > 0 THEN ROUND((v_option_b_votes::NUMERIC / v_total_votes * 100), 2) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get vote history
CREATE OR REPLACE FUNCTION get_vote_history(p_device_uuid UUID)
RETURNS TABLE (
  question_id UUID,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  selected_option TEXT,
  voted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    q.option_a,
    q.option_b,
    v.selected_option,
    v.voted_at
  FROM votes v
  JOIN questions q ON v.question_id = q.id
  WHERE v.device_uuid = p_device_uuid
  ORDER BY v.voted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
