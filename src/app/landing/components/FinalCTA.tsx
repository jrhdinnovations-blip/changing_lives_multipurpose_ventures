'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 lg:py-36 bg-gradient-to-b from-[#0a0f1e] via-[#0d2040] to-[#0a2a35] relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[160px]" />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight tracking-tight mb-6">
          One step.{' '}
          <span className="text-emerald-400">Infinite<br />returns.</span>
        </h2>

        <p className="text-white/45 text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
          CAC Registered · NDIC Insured · Nigerian Owned
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/save/start"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-all duration-150 active:scale-95 shadow-xl shadow-emerald-500/20 group"
          >
            Apply for Membership
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-transparent border border-white/20 hover:border-white/40 text-white font-semibold text-sm transition-all duration-150 active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
