import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface AuthAction {
  type: 'SET_SESSION' | 'SET_USER' | 'SET_PROFILE' | 'SET_LOADING' | 'SET_ERROR' | 'RESET';
  payload?: any;
}
