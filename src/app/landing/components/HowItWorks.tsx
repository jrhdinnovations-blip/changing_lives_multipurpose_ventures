'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Register',
    desc: 'BVN · NIN · ID — under 5 mins',
  },
  {
    num: '02',
    title: 'Fund',
    desc: 'Bank transfer, USSD, or card',
  },
  {
    num: '03',
    title: 'Choose',
    desc: 'Save · Grow · Borrow',
  },
  {
    num: '04',
    title: 'Earn',
    desc: 'Monthly statements & dividends',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#00a86b] relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-14">
          <div className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase mb-5">
            HOW IT WORKS
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight max-w-3xl">
            Zero to financially free.<br />
            Four steps. Fully digital.
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`rounded-2xl p-6 sm:p-7 transition-all duration-200 ${
                i === 0
                  ? 'bg-white/20 border border-white/30'
                  : 'bg-white/10 border border-white/15 hover:bg-white/15'
              }`}
            >
              <div
                className={`text-4xl font-black leading-none mb-5 ${
                  i === 0 ? 'text-white' : 'text-white/40'
                }`}
              >
                {step.num}
              </div>
              <h3
                className={`text-xl font-bold mb-2 ${
                  i === 0 ? 'text-white' : 'text-white'
                }`}
              >
                {step.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/save/start"
          className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-emerald-700 font-bold text-sm hover:bg-white/90 transition-all duration-150 active:scale-95 shadow-lg group"
        >
          Start your journey
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
