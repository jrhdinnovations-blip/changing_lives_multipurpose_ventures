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
      className="py-24 lg:py-36 bg-gradient-to-b from-[#0a0f1e] via-[#0d2040] to-[#0a2a35] relative overflow-hidden"
    >
      {/* Animated radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[160px]"
          style={{
            transform: visible ? 'scale(1)' : 'scale(0.6)',
            opacity: visible ? 1 : 0,
            transition: 'transform 1.4s ease, opacity 1.4s ease',
          }}
        />
      </div>

      {/* Secondary accent glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-[100px]"
          style={{
            transform: visible ? 'scale(1) translateY(60px)' : 'scale(0.5) translateY(60px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 1.6s ease 0.2s, opacity 1.6s ease 0.2s',
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating accent lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '20%', left: '5%', w: 120, delay: 0.4 },
          { top: '70%', right: '8%', w: 80, delay: 0.7 },
          { top: '45%', left: '15%', w: 50, delay: 1.0 },
        ].map((line, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-emerald-400/30 to-transparent"
            style={{
              top: line.top,
              left: line.left,
              right: (line as { right?: string }).right,
              width: line.w,
              opacity: visible ? 1 : 0,
              transition: `opacity 0.8s ease ${line.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold tracking-wide mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          CAC Registered · NDIC Insured · Nigerian Owned
        </div>

        <h2
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight tracking-tight mb-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}
        >
          One step.{' '}
          <span className="text-emerald-400">Infinite<br />returns.</span>
        </h2>

        <p
          className="text-white/65 text-xl sm:text-2xl mb-10 max-w-md mx-auto leading-relaxed font-semibold"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s',
          }}
        >
          Join thousands of Nigerians building real wealth through cooperative finance.
        </p>

        <div
          className="flex items-center justify-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
          }}
        >
          {user ? (
            <Link
              href={['super_admin', 'admin', 'manager', 'staff'].includes(userRole) ? '/admin-dashboard' : '/member-dashboard'}
              className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base tracking-wide transition-all duration-200 active:scale-95 shadow-xl shadow-emerald-500/20 group hover:-translate-y-0.5 hover:shadow-emerald-500/35"
            >
              {/* Pulse ring */}
              {pulse && (
                <span className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/40 animate-ping" />
              )}
              Go to Dashboard
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base tracking-wide transition-all duration-200 active:scale-95 shadow-xl shadow-emerald-500/20 group hover:-translate-y-0.5 hover:shadow-emerald-500/35"
            >
              {/* Pulse ring */}
              {pulse && (
                <span className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/40 animate-ping" />
              )}
              Sign In to Your Account
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
