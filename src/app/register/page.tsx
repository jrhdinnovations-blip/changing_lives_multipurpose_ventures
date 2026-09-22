'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

const PASSWORD_RULES = [
  { id: 'len', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'num', label: 'One number', test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const { signUp, user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!loading && user) router.replace('/member-dashboard');
  }, [user, loading]);

  const set = (field: string, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  function validate(): string[] {
    const errs: string[] = [];
    if (!form.firstName.trim()) errs.push('First name is required.');
    if (!form.lastName.trim()) errs.push('Last name is required.');
    if (!form.email.trim()) errs.push('Email address is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push('Enter a valid email address.');
    if (!form.password) errs.push('Password is required.');
    if (form.password.length < 8) errs.push('Password must be at least 8 characters.');
    if (!/[A-Z]/.test(form.password)) errs.push('Password must include an uppercase letter.');
    if (!/[a-z]/.test(form.password)) errs.push('Password must include a lowercase letter.');
    if (!/\d/.test(form.password)) errs.push('Password must include a number.');
    if (form.password !== form.confirmPassword) errs.push('Passwords do not match.');
    if (!form.agreeTerms) errs.push('You must agree to the Terms of Use and Privacy Policy.');
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setSubmitting(true);

    try {
      await signUp(form.email.trim().toLowerCase(), form.password, {
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setErrors(['This email address is already registered. Please sign in or use a different email.']);
      } else {
        setErrors([msg || 'Registration failed. Please try again.']);
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

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/30">
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Check Your Inbox!</h2>
            <p className="text-slate-400 text-sm mb-2">
              We&apos;ve sent a verification email to:
            </p>
            <p className="text-white font-semibold text-base mb-6 bg-white/10 rounded-xl px-4 py-2.5 inline-block">
              {form.email}
            </p>
            <p className="text-slate-400 text-sm mb-8">
              Click the link in the email to verify your account and complete your registration. Once verified, you&apos;ll complete your profile to activate your membership.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full py-3 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all text-center"
              >
                Go to Sign In
              </Link>
              <p className="text-xs text-slate-600">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary hover:underline"
                >
                  try again
                </button>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const strength = PASSWORD_RULES.filter(r => r.test(form.password)).length;
  const strengthLabel = strength === 0 ? '' : strength <= 1 ? 'Weak' : strength <= 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong';
  const strengthColor = strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-500' : strength === 3 ? 'bg-blue-500' : 'bg-accent';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2.5">
          <Image
            src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
            alt="CLIMPS Logo"
            width={36}
            height={36}
            className="rounded-xl object-cover"
          />
          <span className="font-bold text-lg text-white tracking-tight">CLIMPS</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Have an account?</span>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/10"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-primary/30">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Member Registration
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Join CLIMPS Today</h1>
              <p className="text-sm text-slate-400">Create your cooperative savings account</p>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-400 mb-1">Please fix the following:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {errors.map((e, i) => (
                    <li key={i} className="text-sm text-red-400">{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="reg-firstname"
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    placeholder="e.g. Adaeze"
                    className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="reg-lastname"
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    placeholder="e.g. Okonkwo"
                    className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Create a strong password"
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
                {/* Strength meter */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1.5">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-white/10'}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {PASSWORD_RULES.map(rule => (
                          <span key={rule.id} className={`text-2xs flex items-center gap-1 ${rule.test(form.password) ? 'text-accent' : 'text-slate-600'}`}>
                            {rule.test(form.password) ? '✓' : '○'} {rule.label}
                          </span>
                        ))}
                      </div>
                      {strengthLabel && (
                        <span className={`text-2xs font-bold ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-amber-400' : strength === 3 ? 'text-blue-400' : 'text-accent'}`}>
                          {strengthLabel}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                      form.confirmPassword && form.confirmPassword !== form.password
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : form.confirmPassword && form.confirmPassword === form.password
                        ? 'border-accent/50 focus:ring-accent/30'
                        : 'border-white/20 focus:ring-primary/60 focus:border-primary/60'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
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
                {form.confirmPassword && form.confirmPassword !== form.password && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  id="reg-agree-terms"
                  onClick={() => set('agreeTerms', !form.agreeTerms)}
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                    form.agreeTerms ? 'bg-primary border-primary' : 'border-white/30 bg-transparent'
                  }`}
                  aria-label="Agree to terms"
                >
                  {form.agreeTerms && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <p className="text-sm text-slate-400 leading-relaxed cursor-pointer select-none" onClick={() => set('agreeTerms', !form.agreeTerms)}>
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline" onClick={e => e.stopPropagation()}>
                    Terms of Use
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline" onClick={e => e.stopPropagation()}>
                    Privacy Policy
                  </Link>. I understand this creates a cooperative membership account.
                </p>
              </div>

              {/* Submit */}
              <button
                id="reg-submit"
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating your account…
                  </>
                ) : (
                  <>
                    Create My Account
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-center py-4">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} CLIMPS Cooperative. Your information is encrypted and stored securely.
        </p>
      </footer>
    </div>
  );
}
