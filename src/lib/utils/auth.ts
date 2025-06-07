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
  console.log('[Auth] fetchProfile called for user:', userId);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('[Auth] No valid session found in fetchProfile');
    throw new Error('No valid session found');
  }

  console.log('[Auth] Attempting to fetch profile from Supabase');
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.log('[Auth] Profile fetch error:', {
      code: error.code,
      message: error.message
    });

    if (error.code === 'PGRST116') {
      console.log('[Auth] Profile not found, creating new profile');
      return createProfile(
        userId,
        session.user.email || '',
        session.user.user_metadata?.full_name
      );
    }
    throw error;
  }

  console.log('[Auth] Profile fetched successfully:', profileData);
  return profileData;
};

export const isSessionExpired = (expiresAt: number | undefined): boolean => {
  if (!expiresAt) return true;
  return expiresAt < Date.now() / 1000;
};
