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
  // Start as TRUE so every page waits for the real session check before
  // deciding to redirect. The old `false` default caused the login page to
  // fire its redirect effect with stale localStorage data before the form
  // even rendered.
  const [loading, setLoading] = useState(true);
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
    // 1. Get the real session from Supabase (hits localStorage internally via
    //    the Supabase JS client — no need for a manual scan).
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setSession(session);
          setUser(session.user ?? null);
          if (session.user) fetchProfile(session.user.id);
        }
      })
      .catch(() => {})
      .finally(() => {
        // Mark auth check complete regardless of success/failure so
        // the login page (and all other pages) can safely show their UI.
        setLoading(false);
      });

    // 2. Keep state in sync with any subsequent auth changes.
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
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('auth-token') || key.startsWith('sb-'))) {
            localStorage.removeItem(key);
          }
        }
      } catch {}
    }
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
