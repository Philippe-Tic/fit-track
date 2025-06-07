import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
};

export type DailyEntry = {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  created_at: string;
  updated_at: string;
};

export type MealEntry = {
  id: string;
  daily_entry_id: string;
  description: string;
  image_url?: string;
  created_at: string;
};

export type WorkoutEntry = {
  id: string;
  daily_entry_id: string;
  description: string;
  image_url?: string;
  created_at: string;
};