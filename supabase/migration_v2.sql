-- ═══════════════════════════════════════════════════
-- Migration: Add voting, round modes, and scenario tracking
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  voter_player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  voted_for_player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  round INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, voter_player_id, round)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for anon" ON votes FOR ALL TO anon USING (true) WITH CHECK (true);

-- 2. Add round_mode to rooms (defaults to 'classic' for backwards compat)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'round_mode'
  ) THEN
    ALTER TABLE rooms ADD COLUMN round_mode TEXT DEFAULT 'classic';
  END IF;
END $$;

-- 3. Track used scenarios per room to prevent repeats
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'used_scenarios'
  ) THEN
    ALTER TABLE rooms ADD COLUMN used_scenarios TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 4. Add vote_winner_player_id to verdicts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'verdicts' AND column_name = 'vote_winner_player_id'
  ) THEN
    ALTER TABLE verdicts ADD COLUMN vote_winner_player_id UUID REFERENCES players(id);
  END IF;
END $$;

-- 5. Add voting status to rooms (update constraint if needed)
-- The status column already accepts any TEXT, so 'voting' will work.

-- 6. Enable realtime for votes table
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
