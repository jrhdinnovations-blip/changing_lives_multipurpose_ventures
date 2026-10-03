'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext<any>({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    // 1. Immediately restore session from localStorage if available (0ms client hydration)
    try {
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('auth-token') || key.includes('-auth-token'))) {
            const raw = localStorage.getItem(key);
            if (raw && raw.startsWith('{')) {
              try {
                const parsed = JSON.parse(raw);
                if (parsed && (parsed.access_token || parsed.user)) {
                  setSession(parsed);
                  setUser(parsed.user ?? null);
                  if (parsed.user?.id) fetchProfile(parsed.user.id);
                  break;
                }
              } catch {}
            }
          }
        }
      }
    } catch {}

    // 2. Background sync with Supabase server
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setSession(session);
          setUser(session.user ?? null);
          if (session.user) fetchProfile(session.user.id);
        }
      })
      .catch(() => {});

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, metadata: Record<string, any> = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          avatar_url: metadata?.avatarUrl || '',
          role: 'member',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Sign Out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  // Get Current User
  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  // Check if Email is Verified
  const isEmailVerified = () => {
    return user?.email_confirmed_at !== null;
  };

  // Get User Profile from Database
  const getUserProfile = async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  };

  // Determine user role from profile or metadata
  const userRole =
    user?.email?.toLowerCase() === 'raymondlongdiem22@gmail.com'
      ? 'super_admin'
      : (profile?.role || user?.user_metadata?.role || 'member');

  const isAdmin = ['super_admin', 'admin', 'manager', 'staff'].includes(userRole);
  const isMember = userRole === 'member';

  const value = {
    user,
    session,
    profile,
    loading,
    userRole,
    isAdmin,
    isMember,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isEmailVerified,
    getUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
