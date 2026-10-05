'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function FinalCTA() {
  const { user, userRole } = useAuth();
  const { ref, visible } = useInView(0.15);
  const [pulse, setPulse] = useState(false);

  // Staggered pulse effect on the CTA button once visible
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setPulse(true), 900);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <section
      ref={ref}
      className="py-20 lg:py-28 bg-gradient-to-br from-blue-50/60 via-white to-emerald-50/60 border-t border-slate-200 relative overflow-hidden"
    >
      {/* Subtle ambient light glows */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[700px] h-[700px] rounded-full bg-emerald-200/40 blur-[130px]"
          style={{
            transform: visible ? 'scale(1)' : 'scale(0.6)',
            opacity: visible ? 1 : 0,
            transition: 'transform 1.4s ease, opacity 1.4s ease',
          }}
        />
        <div
          className="w-[500px] h-[500px] rounded-full bg-blue-200/35 blur-[100px] translate-y-20"
          style={{
            transform: visible ? 'scale(1) translateY(60px)' : 'scale(0.5) translateY(60px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 1.6s ease 0.2s, opacity 1.6s ease 0.2s',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        {/* Badge with Red, Green, Blue, White dots */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold tracking-wide mb-6 shadow-sm"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
          }}
        >
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" title="Red" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" title="Green" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" title="Blue" />
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" title="White" />
          </span>
          <span>Changing Lives Multipurpose Cooperative Society</span>
        </div>

        <h2
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 leading-tight tracking-tight mb-5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}
        >
          One step.{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Infinite growth.
          </span>
        </h2>

        <p
          className="text-slate-600 text-base sm:text-xl mb-9 max-w-xl mx-auto leading-relaxed font-semibold"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s',
          }}
        >
          Join thousands of cooperative members building real, sustainable prosperity together across Nigeria.
        </p>

        {/* Action buttons with Red, Green, Blue branding */}
        <div
          className="flex flex-wrap items-center justify-center gap-3.5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
          }}
        >
          {user ? (
            <Link
              href={['super_admin', 'admin', 'manager', 'staff'].includes(userRole) ? '/admin-dashboard' : '/member-dashboard'}
              className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-600/25 group"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-600/25 group"
            >
              <span>Join CLIMPS Today</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          <Link
            href="/savings-products"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all duration-200 active:scale-95 shadow-lg shadow-blue-600/25"
          >
            Explore Savings
          </Link>

          <Link
            href="/loan-application"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white border-2 border-red-500 hover:bg-red-50 text-red-600 font-bold text-base transition-all duration-200 active:scale-95 shadow-sm"
          >
            Apply for Loan
          </Link>
        </div>
      </div>
    </section>
  );
}
