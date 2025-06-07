/*
  # Initial Schema for FitTrack Application

  1. Tables
    - `profiles`: Stores user profile information
    - `daily_entries`: Stores daily tracking data including weight
    - `meal_entries`: Stores meal information with optional images
    - `workout_entries`: Stores workout information with optional images

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create daily entries table
CREATE TABLE IF NOT EXISTS daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create meal entries table
CREATE TABLE IF NOT EXISTS meal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create workout entries table
CREATE TABLE IF NOT EXISTS workout_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('meal_images', 'meal_images', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('workout_images', 'workout_images', true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for daily entries
CREATE POLICY "Users can view their own daily entries"
  ON daily_entries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily entries"
  ON daily_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily entries"
  ON daily_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily entries"
  ON daily_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for meal entries
CREATE POLICY "Users can view their own meal entries"
  ON meal_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = meal_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own meal entries"
  ON meal_entries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = meal_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own meal entries"
  ON meal_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = meal_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own meal entries"
  ON meal_entries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = meal_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

-- Create RLS policies for workout entries
CREATE POLICY "Users can view their own workout entries"
  ON workout_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = workout_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own workout entries"
  ON workout_entries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = workout_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout entries"
  ON workout_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = workout_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout entries"
  ON workout_entries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = workout_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

-- Create storage policies
CREATE POLICY "Users can upload meal images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'meal_images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Users can access meal images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'meal_images');

CREATE POLICY "Users can upload workout images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'workout_images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Users can access workout images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'workout_images');