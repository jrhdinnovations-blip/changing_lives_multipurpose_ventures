'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  prefillEmail?: string;
  prefillPassword?: string;
}

export default function LoginForm({ prefillEmail, prefillPassword }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: { rememberMe: false } });

  useEffect(() => {
    if (prefillEmail) setValue('email', prefillEmail);
    if (prefillPassword) setValue('password', prefillPassword);
  }, [prefillEmail, prefillPassword, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setLoginError('');
    try {
      const result = await signIn(data.email, data.password);
      const role = result?.user?.user_metadata?.role || 'member';
      toast.success('Welcome back! Redirecting…');

      if (['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
        setTimeout(() => router.push('/admin-dashboard'), 600);
        return;
      }

      // For members: check KYC completion before routing
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: memberData } = await supabase
          .from('members')
          .select('kyc_completed')
          .eq('user_id', result?.user?.id)
          .maybeSingle();

        setTimeout(() => {
          if (memberData && !memberData.kyc_completed) {
            router.push('/onboarding');
          } else {
            router.push('/member-dashboard');
          }
        }, 600);
      } catch {
        setTimeout(() => router.push('/member-dashboard'), 600);
      }
    } catch (error: any) {
      setLoginError(error?.message || 'Invalid credentials. Please check your email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your CLIMPS account</p>
      </div>

      {loginError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-destructive/8 border border-destructive/20 rounded-xl mb-5">
          <AlertCircle size={15} className="text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="label-base">Email Address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`input-base ${errors.email ? 'border-destructive focus:ring-destructive' : ''}`}
            {...register('email', {
              required: 'Email address is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="label-base mb-0">Password</label>
            <button type="button" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`input-base pr-11 ${errors.password ? 'border-destructive focus:ring-destructive' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4 h-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
            {...register('rememberMe')}
          />
          <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none">
            Keep me signed in for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full h-11 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Signing in…</span>
            </>
          ) : (
            'Sign In to CLIMPS'
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'google-btn', label: 'Google', icon: 'G' },
          { id: 'ms-btn', label: 'Microsoft', icon: 'M' },
        ].map(p => (
          <button
            key={p.id}
            type="button"
            className="btn-outline flex items-center justify-center gap-2 h-11"
          >
            <span className="font-bold text-sm">{p.icon}</span>
            <span className="text-sm">{p.label}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Not a member yet?{' '}
        <Link href="/sign-up-login-screen" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Register here
        </Link>
      </p>
    </div>
  );
}