CREATE FUNCTION submit_vote_and_get_results_v2(
  p_device_uuid UUID,
  p_question_id UUID,
  p_selected_option TEXT
)
RETURNS TABLE (
  ret_question_id UUID,
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
  INSERT INTO votes (device_uuid, question_id, selected_option)
  VALUES (p_device_uuid, p_question_id, p_selected_option)
  ON CONFLICT (device_uuid, question_id) DO NOTHING;

  SELECT COUNT(*) INTO v_total_votes
  FROM votes v
  WHERE v.question_id = p_question_id;

  SELECT COUNT(*) INTO v_option_a_votes
  FROM votes v
  WHERE v.question_id = p_question_id
    AND v.selected_option = 'A';

  v_option_b_votes := v_total_votes - v_option_a_votes;

  RETURN QUERY
  SELECT 
    p_question_id AS ret_question_id,
    v_total_votes,
    v_option_a_votes,
    v_option_b_votes,
    CASE WHEN v_total_votes > 0 THEN ROUND((v_option_a_votes::NUMERIC / v_total_votes * 100), 2) ELSE 0 END,
    CASE WHEN v_total_votes > 0 THEN ROUND((v_option_b_votes::NUMERIC / v_total_votes * 100), 2) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
