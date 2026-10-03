'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const stats = [
  { value: '5,000+', label: 'MEMBERS' },
  { value: '₦2.4B', label: 'MANAGED' },
  { value: '9–25%', label: 'RETURNS P.A.' },
  { value: '48hrs', label: 'LOAN APPROVAL' },
];

export default function HeroSection() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex flex-col justify-end overflow-hidden bg-[#0a0f1e] text-white">
        {/* Subtle teal glow top-right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-emerald-400/8 blur-[120px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-40 pb-20 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 text-white/60 text-xs font-medium uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cooperative Multipurpose Society
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[82px] font-black text-white tracking-tight leading-[1.03] mb-8 max-w-4xl">
            Save. Grow.<br />
            <span className="text-emerald-400">Prosper together.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-white/55 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
            A structured wealth-building cooperative for Nigerians — savings, investments, and loans, all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/save/start"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm tracking-wide transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-500/25 group"
            >
              Apply for Membership
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#products"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-transparent border border-white/20 hover:border-white/40 text-white font-semibold text-sm transition-all duration-150 active:scale-95"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#f5f6f8] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="text-4xl sm:text-5xl font-black text-[#0d1b2e] tracking-tight leading-none mb-2">
                  {stat.value}
                </div>
                <div className="text-xs font-bold tracking-[0.15em] text-gray-500 uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
