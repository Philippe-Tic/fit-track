import { supabase } from '../supabase';
import { Profile } from '../types/auth';

export const createProfile = async (userId: string, email: string, fullName?: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        email,
        full_name: fullName,
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No valid session found');
  }

  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return createProfile(
        userId,
        session.user.email || '',
        session.user.user_metadata?.full_name
      );
    }
    throw error;
  }

  return profileData;
};

export const isSessionExpired = (expiresAt: number | undefined): boolean => {
  if (!expiresAt) return true;
  return expiresAt < Date.now() / 1000;
};
