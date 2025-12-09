ALTER TABLE questions
ADD COLUMN submitted_by UUID,
ADD COLUMN approved BOOLEAN DEFAULT FALSE,
ADD COLUMN approved_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION submit_question(
  p_question_text TEXT,
  p_option_a TEXT,
  p_option_b TEXT,
  p_submitted_by UUID
)
RETURNS UUID AS $$
DECLARE
  new_question_id UUID;
BEGIN
  INSERT INTO questions (question_text, option_a, option_b, submitted_by, approved, created_at)
  VALUES (p_question_text, p_option_a, p_option_b, p_submitted_by, false, NOW())
  RETURNING id INTO new_question_id;

  RETURN new_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_question(
  p_question_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE questions
  SET approved = true,
      approved_at = NOW()
  WHERE id = p_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    AND q.approved = true
    AND NOT EXISTS (
      SELECT 1 
      FROM votes v 
      WHERE v.question_id = q.id 
        AND v.device_uuid = p_device_uuid
    )
  ORDER BY q.created_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

UPDATE questions
SET approved = true
WHERE approved IS NULL OR approved = false;
