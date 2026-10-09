'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
  const { signIn, signOut, user, loading, userRole } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || searchParams.get('redirectTo');

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function routeByRole(role: string) {
    if (['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
      router.replace('/admin-dashboard');
      return;
    }
    if (role === 'accountant') {
      router.replace('/accountant-dashboard');
      return;
    }
    if (redirectTarget && redirectTarget.startsWith('/') && !redirectTarget.startsWith('//')) {
      router.replace(redirectTarget);
      return;
    }
    router.replace('/member-dashboard');
  }

  // Display sign out confirmation message if coming from logout
  useEffect(() => {
    if (searchParams.get('logout') === '1' || searchParams.get('signout') === '1') {
      setSuccessMsg('You have been signed out successfully.');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const data = await signIn(form.email.trim().toLowerCase(), form.password);
      const role = data?.user?.user_metadata?.role || 'member';
      routeByRole(role);
    } catch (err: any) {
      const msg = err?.message || '';
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('fetch') ||
        msg.includes('ENOTFOUND') ||
        msg.includes('network') ||
        err?.name === 'TypeError'
      ) {
        setError(
          'Unable to connect to the server. This usually means the service is temporarily unavailable or your internet connection dropped. Please try again in a moment.'
        );
      } else if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please try again.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Please check your inbox and verify your email address before logging in.');
      } else if (msg.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a few minutes and try again.');
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }

  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2.5 group">
          <Image
            src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
            alt="CLIMPS Logo"
            width={36}
            height={36}
            className="rounded-xl object-cover"
          />
          <span className="font-bold text-lg text-white tracking-tight">CLIMPS</span>
        </Link>
      </header>

      {/* Main */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-accent/30">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Secure Sign In
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
              <p className="text-sm text-slate-400">
                {redirectTarget ? 'Sign in to access your requested service' : 'Sign in to your CLIMPS account'}
              </p>
            </div>

            {/* Redirection banner if present */}
            {redirectTarget && (
              <div className="mb-5 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 text-xs text-blue-300 flex items-center gap-2.5">
                <svg className="w-4 h-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Please sign in to proceed with your service subscription.</span>
              </div>
            )}

            {/* Success message */}
            {successMsg && (
              <div className="mb-5 bg-accent/10 border border-accent/30 rounded-xl p-4 flex gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-accent">{successMsg}</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Already authenticated banner with choices */}
            {user && (
              <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-300 mb-1">
                  You are currently signed in as
                </p>
                <p className="text-sm font-bold text-emerald-400 mb-3 break-all">
                  {user.email}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => routeByRole(userRole)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                  >
                    Continue to Dashboard →
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      setSuccessMsg('Signed out. Please enter your credentials below.');
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all border border-white/10 active:scale-95"
                  >
                    Sign In with Different Account
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-200">Password</label>
                  <Link
                    href="/auth/reset-password"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="remember-me"
                  onClick={() => setRememberMe(v => !v)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    rememberMe ? 'bg-primary border-primary' : 'border-white/30 bg-transparent'
                  }`}
                  aria-label="Remember me"
                >
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <label className="text-sm text-slate-400 cursor-pointer select-none" onClick={() => setRememberMe(v => !v)}>
                  Keep me signed in
                </label>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* OTP placeholder */}
            <div className="relative">
              <button
                disabled
                className="w-full py-3 px-6 rounded-xl border border-white/10 text-slate-500 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Sign in with OTP / 2FA
                <span className="ml-auto text-2xs bg-white/10 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
              Member accounts are managed by administrators.{' '}
              <a href="mailto:admin@climps.org" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Contact admin for access
              </a>
            </p>
          </div>

          {/* Role note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              Staff, Managers & Admins use their assigned email credentials. Contact your administrator for access.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 px-6">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} CLIMPS Cooperative. All rights reserved. · Your data is encrypted and secure.
        </p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
