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
      className="py-20 lg:py-28 bg-[#050B17] border-t border-white/10 relative overflow-hidden"
    >
      {/* Radiant ambient glow orbs */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full bg-emerald-500/15 blur-[140px]"
          style={{
            transform: visible ? 'scale(1)' : 'scale(0.6)',
            opacity: visible ? 1 : 0,
            transition: 'transform 1.4s ease, opacity 1.4s ease',
          }}
        />
        <div
          className="w-[450px] h-[450px] rounded-full bg-blue-500/15 blur-[120px] translate-y-16"
          style={{
            transform: visible ? 'scale(1) translateY(40px)' : 'scale(0.5) translateY(40px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 1.6s ease 0.2s, opacity 1.6s ease 0.2s',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-slate-200 text-xs sm:text-sm font-bold tracking-wide mb-6 backdrop-blur-md shadow-lg shadow-black/20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
          }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" title="Red" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] shadow-sm shadow-emerald-500/50" title="Green" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" title="Blue" />
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm shadow-white/50" title="White" />
          </span>
          <span className="text-slate-200">Changing Lives Multipurpose Ventures</span>
        </div>

        <h2
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tight mb-5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}
        >
          One step.{' '}
          <span className="bg-gradient-to-r from-[#00E599] via-emerald-400 to-[#00D084] bg-clip-text text-transparent">
            Infinite growth.
          </span>
        </h2>

        <p
          className="text-slate-300 text-base sm:text-xl mb-9 max-w-xl mx-auto leading-relaxed font-normal"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s',
          }}
        >
          Join thousands of members building real, sustainable prosperity together across Nigeria.
        </p>

        {/* Action buttons */}
        <div
          className="flex flex-wrap items-center justify-center gap-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
          }}
        >
          {user ? (
            <Link
              href={['super_admin', 'admin', 'manager', 'staff'].includes(userRole) ? '/admin-dashboard' : '/member-dashboard'}
              className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#00D084] hover:bg-[#00E599] text-slate-950 font-black text-base tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/25 group"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#00D084] hover:bg-[#00E599] text-slate-950 font-black text-base tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/25 group"
            >
              <span>Join CLIMPS Today</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          <Link
            href="/savings-products"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-base transition-all duration-200 active:scale-95 backdrop-blur-md shadow-md"
          >
            Explore Savings
          </Link>

          <Link
            href="/loan-application"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-base transition-all duration-200 active:scale-95 shadow-sm"
          >
            Apply for Loan
          </Link>
        </div>
      </div>
    </section>
  );
}
