 -- Drop existing tables (in correct order due to foreign keys)
  DROP TABLE IF EXISTS occupations CASCADE;
  DROP TABLE IF EXISTS activities CASCADE;
  DROP TABLE IF EXISTS time_blocks CASCADE;
  DROP TABLE IF EXISTS users CASCADE;

  -- Create users table (managed by Supabase Auth)
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create time_blocks table (core data model)
  CREATE TABLE IF NOT EXISTS time_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    feeling INTEGER CHECK (feeling BETWEEN -2 AND 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create activities table
  CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
  );

  -- Create occupations table (links time_blocks to activities + tasks)
  CREATE TABLE IF NOT EXISTS occupations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_block_id UUID NOT NULL REFERENCES time_blocks(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_time_blocks_user_id ON time_blocks(user_id);
  CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON time_blocks(date);
  CREATE INDEX IF NOT EXISTS idx_time_blocks_user_date ON time_blocks(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
  CREATE INDEX IF NOT EXISTS idx_occupations_time_block_id ON occupations(time_block_id);
  CREATE INDEX IF NOT EXISTS idx_occupations_activity_id ON occupations(activity_id);

  -- Enable RLS (Row Level Security)
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
  ALTER TABLE occupations ENABLE ROW LEVEL SECURITY;

  -- RLS Policies
  CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

  CREATE POLICY "Users can select own time blocks" ON time_blocks
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own time blocks" ON time_blocks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own time blocks" ON time_blocks
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users can select own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can select own occupations" ON occupations
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM time_blocks tb
        WHERE tb.id = occupations.time_block_id
        AND tb.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can insert own occupations" ON occupations
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM time_blocks tb
        WHERE tb.id = occupations.time_block_id
        AND tb.user_id = auth.uid()
      )
    );