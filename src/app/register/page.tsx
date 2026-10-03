'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900">
      {/* Ambient effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center">
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
        <div className="w-full max-w-lg text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 mb-8 mx-auto">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Card */}
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-amber-300 text-xs font-semibold uppercase tracking-widest">Membership by Invitation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              Member registration is<br />
              <span className="text-primary">admin-controlled</span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed mb-8">
              New member accounts are created exclusively by CLIMPS administrators. 
              If you've been invited to join, please contact your cooperative office or the administrator who reached out to you.
            </p>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  label: 'Contact Office',
                  sub: 'Reach out via email',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  label: 'Verified Only',
                  sub: 'KYC-compliant process',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  label: 'Quick Setup',
                  sub: 'Admin creates in minutes',
                },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-2 text-primary">
                    {item.icon}
                  </div>
                  <p className="text-white text-xs font-semibold">{item.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all duration-150 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In to Your Account
              </Link>
              <Link
                href="/landing"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all duration-150 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>

          {/* Contact hint */}
          <p className="mt-6 text-xs text-slate-600">
            Already a member?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in here
            </Link>
            {' · '}
            Questions?{' '}
            <a href="mailto:admin@climps.org" className="text-slate-500 hover:text-slate-400 transition-colors">
              Contact admin
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 px-6">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} CLIMPS Cooperative. All rights reserved. · Member accounts managed by administrators only.
        </p>
      </footer>
    </div>
  );
}
