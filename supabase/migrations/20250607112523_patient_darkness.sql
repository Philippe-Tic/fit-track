/*
  # Fix authentication and RLS policies

  1. Security
    - Fix RLS policies for all tables
    - Add proper auth function references
    - Ensure proper user access control

  2. Triggers
    - Add trigger to automatically create profile on user signup
    - Ensure data consistency

  3. Storage
    - Fix storage bucket policies
    - Ensure proper image upload permissions
*/

-- Fix auth function reference (use auth.uid() instead of uid())
-- Update profiles policies
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update daily_entries policies
DROP POLICY IF EXISTS "Users can create their own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can view their own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can update their own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can delete their own daily entries" ON daily_entries;

CREATE POLICY "Users can create their own daily entries"
  ON daily_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own daily entries"
  ON daily_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily entries"
  ON daily_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily entries"
  ON daily_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update meal_entries policies
DROP POLICY IF EXISTS "Users can create their own meal entries" ON meal_entries;
DROP POLICY IF EXISTS "Users can view their own meal entries" ON meal_entries;
DROP POLICY IF EXISTS "Users can update their own meal entries" ON meal_entries;
DROP POLICY IF EXISTS "Users can delete their own meal entries" ON meal_entries;

CREATE POLICY "Users can create their own meal entries"
  ON meal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = meal_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own meal entries"
  ON meal_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = meal_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own meal entries"
  ON meal_entries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = meal_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = meal_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own meal entries"
  ON meal_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = meal_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

-- Update workout_entries policies
DROP POLICY IF EXISTS "Users can create their own workout entries" ON workout_entries;
DROP POLICY IF EXISTS "Users can view their own workout entries" ON workout_entries;
DROP POLICY IF EXISTS "Users can update their own workout entries" ON workout_entries;
DROP POLICY IF EXISTS "Users can delete their own workout entries" ON workout_entries;

CREATE POLICY "Users can create their own workout entries"
  ON workout_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = workout_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own workout entries"
  ON workout_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = workout_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout entries"
  ON workout_entries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = workout_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = workout_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout entries"
  ON workout_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      WHERE daily_entries.id = workout_entries.daily_entry_id
      AND daily_entries.user_id = auth.uid()
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('meal_images', 'meal_images', true),
  ('workout_images', 'workout_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for meal_images
DROP POLICY IF EXISTS "Users can upload their own meal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own meal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own meal images" ON storage.objects;

CREATE POLICY "Users can upload their own meal images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'meal_images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own meal images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'meal_images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own meal images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'meal_images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for workout_images
DROP POLICY IF EXISTS "Users can upload their own workout images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own workout images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own workout images" ON storage.objects;

CREATE POLICY "Users can upload their own workout images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'workout_images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own workout images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'workout_images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own workout images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'workout_images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public access to view images
CREATE POLICY "Public can view meal images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'meal_images');

CREATE POLICY "Public can view workout images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'workout_images');