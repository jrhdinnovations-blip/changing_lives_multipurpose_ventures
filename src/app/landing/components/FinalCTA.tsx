'use client';
import React from 'react';
import Link from 'next/link';

const ctaItems = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Start Saving',
    desc: 'Open a savings account today',
    href: '/',
    style: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    label: 'Invest Now',
    desc: 'Grow your wealth with us',
    href: '/',
    style: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'Apply for Loan',
    desc: 'Get funds in 48 hours',
    href: '/',
    style: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Become a Member',
    desc: 'Join 12,400+ members',
    href: '/',
    style: 'bg-primary hover:bg-primary/90 text-white',
  },
];

export default function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden gradient-primary p-10 sm:p-14 lg:p-16">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />

          <div className="relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">Ready to Start?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Your financial future<br />
                <span className="text-emerald-300">begins with one step.</span>
              </h2>
              <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto">
                Join thousands of Nigerians who trust CLIMPS to save, invest, and borrow smarter. Registration takes less than 5 minutes.
              </p>
            </div>

            {/* CTA grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {ctaItems?.map((item) => (
                <Link
                  key={item?.label}
                  href={item?.href}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg ${item?.style}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                    {item?.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-base">{item?.label}</div>
                    <div className="text-white/70 text-xs mt-0.5">{item?.desc}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-white/10">
              {[
                { icon: '🏛️', text: 'CAC Registered' },
                { icon: '🔒', text: 'NDIC Insured' },
                { icon: '⚡', text: 'Instant Transfers' },
                { icon: '📱', text: 'Mobile Banking' },
                { icon: '🇳🇬', text: 'Nigerian Owned' },
              ]?.map((item) => (
                <div key={item?.text} className="flex items-center gap-2 text-white/60 text-sm">
                  <span>{item?.icon}</span>
                  <span>{item?.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
