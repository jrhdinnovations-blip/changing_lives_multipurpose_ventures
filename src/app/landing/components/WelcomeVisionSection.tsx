'use client';
import React from 'react';
import Link from 'next/link';
import {
  Eye,
  Target,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Coins
} from 'lucide-react';

export default function WelcomeVisionSection() {
  return (
    <section id="welcome-vision" className="py-12 sm:py-16 lg:py-20 bg-slate-50 relative overflow-hidden border-t border-slate-200 scroll-mt-16">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[500px] h-[500px] rounded-full bg-blue-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-red-100/25 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── TOP HEADER: WELCOME TO CLIMP (DIRECT & CONCISE) ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            </span>
            <span>Welcome to CLIMPS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Welcome to <span className="text-emerald-600">CLIMP</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 block mt-1">
              Changing Lives Multipurpose Cooperative Society
            </span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed font-medium max-w-2xl mx-auto mb-6">
            An officially registered Nigerian cooperative society empowering individuals, entrepreneurs, and families to build sustainable wealth through structured savings, pooled high-yield investment circles, and express 24-hour loans.
          </p>

          {/* Trust badges strip — showcasing Red, Green, Blue, White */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Registered Cooperative Society</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-800">
              <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="font-extrabold">24-Hour Express Loans</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
              <Coins className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>4% Monthly Savings Growth</span>
            </div>
          </div>
        </div>

        {/* ── OUR VISION & MISSION DUAL CARDS (LIGHT THEME) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          
          {/* VISION CARD (BLUE & WHITE) */}
          <div className="relative rounded-2xl bg-white border-2 border-blue-100 p-6 sm:p-8 shadow-md shadow-blue-500/5 flex flex-col justify-between group hover:border-blue-400 transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Our Vision</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest">
                  Core Purpose
                </span>
              </div>

              <blockquote className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 leading-snug mb-5">
                &ldquo;To build an ecosystem that empowers people and businesses to{' '}
                <span className="text-blue-600 underline decoration-blue-200 decoration-2 underline-offset-4">
                  create sustainable wealth, seize opportunities, and change lives.
                </span>
                &rdquo;
              </blockquote>

              {/* Compact Vision Pillars */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <TrendingUp className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <div className="text-[11px] font-black text-slate-800 leading-tight">Sustainable Wealth</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Zap className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-[11px] font-black text-slate-800 leading-tight">24h Opportunities</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Users className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                  <div className="text-[11px] font-black text-slate-800 leading-tight">Changing Lives</div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Founded on transparency & mutual trust</span>
              <Link href="/about" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                Read About Us <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* MISSION & MANDATE CARD (GREEN & WHITE) */}
          <div className="relative rounded-2xl bg-white border-2 border-emerald-100 p-6 sm:p-8 shadow-md shadow-emerald-500/5 flex flex-col justify-between group hover:border-emerald-400 transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Our Mandate</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                  Action Plan
                </span>
              </div>

              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 mb-3 leading-snug">
                Transparent Stewardship. Maximum Member Value.
              </h3>

              <div className="space-y-2.5 mb-5">
                {[
                  'Express 24-hour loan turnaround for qualified members',
                  'High-yield savings earning 4% monthly interest (48% p.a.)',
                  'Exclusive Wealth Circle investments with 3.5% monthly payouts',
                  'Annual cooperative surplus profit dividends for all members',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Open to all qualified members</span>
              <Link href="/register" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                Join CLIMPS Today <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
