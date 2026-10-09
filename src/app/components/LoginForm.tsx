'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth, resolveUserRole } from '@/contexts/AuthContext';

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
      let loginEmail = data.email.trim();

      // If user typed a phone number instead of an email, look up their email from members
      if (!loginEmail.includes('@')) {
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const cleanPhone = loginEmail.replace(/[\s+-]/g, '');
          const phoneVariants = [
            cleanPhone,
            cleanPhone.startsWith('234') ? '0' + cleanPhone.slice(3) : null,
            cleanPhone.startsWith('0') ? cleanPhone.slice(1) : '0' + cleanPhone,
          ].filter(Boolean) as string[];

          const { data: foundMember } = await supabase
            .from('members')
            .select('email')
            .or(phoneVariants.map(p => `phone.ilike.%${p}%`).join(','))
            .maybeSingle();

          if (foundMember?.email) {
            loginEmail = foundMember.email;
          }
        } catch {
          // continue with input
        }
      }

      // Try signing in; if password fails, try phone password variations
      let result;
      try {
        result = await signIn(loginEmail.toLowerCase(), data.password.trim());
      } catch (firstErr: any) {
        const rawPwd = data.password.trim();
        const altPwds: string[] = [];
        if (rawPwd.startsWith('+234')) {
          altPwds.push(rawPwd.slice(4), '0' + rawPwd.slice(4));
        } else if (rawPwd.startsWith('234') && rawPwd.length > 10) {
          altPwds.push(rawPwd.slice(3), '0' + rawPwd.slice(3));
        } else if (rawPwd.startsWith('0') && rawPwd.length === 11) {
          altPwds.push(rawPwd.slice(1));
        } else if (!rawPwd.startsWith('0') && (rawPwd.length === 10 || rawPwd.length === 9)) {
          altPwds.push('0' + rawPwd);
        }

        let signedIn = false;
        for (const alt of altPwds) {
          try {
            result = await signIn(loginEmail.toLowerCase(), alt);
            signedIn = true;
            break;
          } catch {}
        }
        if (!signedIn) throw firstErr;
      }

      const effectiveEmail = (loginEmail || result?.user?.email || '').toLowerCase();
      const role = resolveUserRole(effectiveEmail, result?.user?.user_metadata?.role);
      toast.success('Welcome back! Redirecting…');

      if (['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
        setTimeout(() => router.push('/admin-dashboard'), 600);
        return;
      }

      if (role === 'accountant') {
        setTimeout(() => router.push('/accountant-dashboard'), 600);
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
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="text-sm text-white/50 mt-1">Sign in to your CLIMPS account</p>
      </div>

      {loginError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-500/8 border border-destructive/20 rounded-xl mb-5">
          <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="label-base">Email Address or Phone Number</label>
          <input
            id="login-email"
            type="text"
            autoComplete="username"
            placeholder="name@example.com or 080..."
            className={`input-base ${errors.email ? 'border-destructive focus:ring-destructive' : ''}`}
            {...register('email', {
              required: 'Email address or phone number is required',
            })}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="label-base mb-0">Password</label>
            <button type="button" className="text-xs font-medium text-emerald-400 hover:text-emerald-400/80 transition-colors">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
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
            className="w-4 h-4 rounded border-white/10 text-emerald-400 focus:ring-ring cursor-pointer"
            {...register('rememberMe')}
          />
          <label htmlFor="remember-me" className="text-sm text-white/50 cursor-pointer select-none">
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
        <span className="text-xs text-white/50">or continue with</span>
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

      <p className="text-center text-sm text-white/50 mt-5">
        Member accounts are managed by administrators.{' '}
        <a href="mailto:admin@climps.org" className="font-semibold text-emerald-400 hover:text-emerald-400/80 transition-colors">
          Contact admin for access
        </a>
      </p>
    </div>
  );
}