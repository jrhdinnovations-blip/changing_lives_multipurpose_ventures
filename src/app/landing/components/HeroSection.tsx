'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const ROTATING_WORDS = ['SAVE.', 'INVEST.', 'BORROW.', 'GROW.'];
const WORD_COLORS = ['text-blue-300', 'text-emerald-300', 'text-amber-300', 'text-white'];

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % ROTATING_WORDS?.length);
        setVisible(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: '12,400+', label: 'Active Members' },
    { value: '₦4.2B', label: 'Total Savings' },
    { value: '₦1.8B', label: 'Loans Disbursed' },
    { value: '18%', label: 'Avg. Investment Return' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary" />
      {/* Animated blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Nigeria's Trusted Financial Cooperative</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
            <span
              className={`inline-block transition-all duration-300 ${WORD_COLORS?.[wordIndex]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
              style={{ minWidth: '220px' }}
            >
              {ROTATING_WORDS?.[wordIndex]}
            </span>
            <br />
            <span className="text-white">Your Financial</span>
            <br />
            <span className="text-white/80">Future Starts Here.</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
            CLIMPS Cooperative empowers members with flexible savings plans, competitive investment portfolios, and accessible loans — all under one trusted roof since 1998.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 mb-16">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-900/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Saving
            </Link>
            <Link
              href="/investment-products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all duration-150 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Invest Now
            </Link>
            <Link
              href="/loan-application"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all duration-150 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Apply for Loan
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-all duration-150 active:scale-95 shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Become a Member
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats?.map((stat) => (
              <div key={stat?.label} className="border-l-2 border-white/20 pl-4">
                <div className="text-2xl sm:text-3xl font-bold text-white font-tabular">{stat?.value}</div>
                <div className="text-white/60 text-xs sm:text-sm mt-0.5">{stat?.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}
