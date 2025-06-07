import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { supabase } from './supabase';
import { AuthAction, AuthContextType, AuthState } from './types/auth';
import { fetchProfile, isSessionExpired } from './utils/auth';

const initialState: AuthState = {
  session: null,
  user: null,
  profile: null,
  loading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { session, user, profile, loading, error } = state;

  useEffect(() => {
    let mounted = true;

    const handleSession = async (currentSession: Session | null) => {
      if (!mounted) return;

      if (!currentSession) {
        dispatch({ type: 'RESET' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        // Check if session is expired
        if (isSessionExpired(currentSession.expires_at)) {
          const { data: { session: refreshedSession }, error: refreshError } =
            await supabase.auth.refreshSession();

          if (refreshError || !refreshedSession) {
            dispatch({ type: 'SET_ERROR', payload: refreshError?.message || 'Session refresh failed' });
            dispatch({ type: 'RESET' });
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }

          dispatch({ type: 'SET_SESSION', payload: refreshedSession });
          dispatch({ type: 'SET_USER', payload: refreshedSession.user });

          try {
            const userProfile = await fetchProfile(refreshedSession.user.id);
            dispatch({ type: 'SET_PROFILE', payload: userProfile });
          } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch profile' });
          }
        } else {
          dispatch({ type: 'SET_SESSION', payload: currentSession });
          dispatch({ type: 'SET_USER', payload: currentSession.user });

          try {
            const userProfile = await fetchProfile(currentSession.user.id);
            dispatch({ type: 'SET_PROFILE', payload: userProfile });
          } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch profile' });
          }
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An unexpected error occurred' });
        dispatch({ type: 'RESET' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        handleSession(newSession);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Sign in failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Sign up failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      dispatch({ type: 'RESET' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Sign out failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
