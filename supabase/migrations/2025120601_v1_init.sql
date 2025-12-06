-- Migration 001: Initial Schema
-- File: supabase/migrations/20250101000000_initial_schema.sql

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT question_text_length CHECK (char_length(question_text) <= 200),
  CONSTRAINT option_a_length CHECK (char_length(option_a) <= 100),
  CONSTRAINT option_b_length CHECK (char_length(option_b) <= 100)
);

-- Device identities (anonymous users)
CREATE TABLE device_ids (
  device_uuid UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_uuid UUID NOT NULL REFERENCES device_ids(device_uuid) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B')),
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_uuid, question_id)
);


-- Indexes for performance
CREATE INDEX idx_votes_question_id ON votes(question_id);
CREATE INDEX idx_votes_device_uuid ON votes(device_uuid);
CREATE INDEX idx_votes_voted_at ON votes(voted_at DESC);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public read for active questions
CREATE POLICY "Questions are viewable by everyone" 
  ON questions FOR SELECT 
  USING (is_active = true);

-- Device IDs: users can only insert/update their own
CREATE POLICY "Users can create their device identity" 
  ON device_ids FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own device record" 
  ON device_ids FOR UPDATE 
  USING (device_uuid = current_setting('app.device_uuid')::UUID);

-- Votes: users can only vote once per question
CREATE POLICY "Users can create votes" 
  ON votes FOR INSERT 
  WITH CHECK (device_uuid = current_setting('app.device_uuid')::UUID);

CREATE POLICY "Users can view their own votes" 
  ON votes FOR SELECT 
  USING (device_uuid = current_setting('app.device_uuid')::UUID);
