CREATE OR REPLACE FUNCTION submit_question(
  p_question_text TEXT,
  p_option_a TEXT,
  p_option_b TEXT,
  p_submitted_by UUID
)
RETURNS UUID AS $$
DECLARE
  new_question_id UUID;
  submission_count INT;
BEGIN
  SELECT COUNT(*) INTO submission_count
  FROM questions
  WHERE submitted_by = p_submitted_by
    AND created_at >= NOW() - INTERVAL '1 day';

  IF submission_count >= 3 THEN
    RAISE EXCEPTION 'Submission limit reached: max 3 questions per day';
  END IF;

  INSERT INTO questions (question_text, option_a, option_b, submitted_by, approved, created_at)
  VALUES (p_question_text, p_option_a, p_option_b, p_submitted_by, false, NOW())
  RETURNING id INTO new_question_id;

  RETURN new_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
