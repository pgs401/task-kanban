-- Task Kanban schema
-- Run this in the Supabase SQL editor for your project.

-- Boards Table
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, title)
);

-- Cards Table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  "column" text NOT NULL CHECK ("column" IN ('todo', 'in_progress', 'done')),
  title text NOT NULL,
  description text,
  position integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cards_board_id_idx ON cards(board_id);

-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boards
DROP POLICY IF EXISTS "Users can view their own boards" ON boards;
CREATE POLICY "Users can view their own boards"
  ON boards FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own boards" ON boards;
CREATE POLICY "Users can insert their own boards"
  ON boards FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own boards" ON boards;
CREATE POLICY "Users can update their own boards"
  ON boards FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own boards" ON boards;
CREATE POLICY "Users can delete their own boards"
  ON boards FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cards
DROP POLICY IF EXISTS "Users can view cards in their boards" ON cards;
CREATE POLICY "Users can view cards in their boards"
  ON cards FOR SELECT USING (
    board_id IN (SELECT id FROM boards WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert cards in their boards" ON cards;
CREATE POLICY "Users can insert cards in their boards"
  ON cards FOR INSERT WITH CHECK (
    board_id IN (SELECT id FROM boards WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update cards in their boards" ON cards;
CREATE POLICY "Users can update cards in their boards"
  ON cards FOR UPDATE USING (
    board_id IN (SELECT id FROM boards WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete cards in their boards" ON cards;
CREATE POLICY "Users can delete cards in their boards"
  ON cards FOR DELETE USING (
    board_id IN (SELECT id FROM boards WHERE user_id = auth.uid())
  );
