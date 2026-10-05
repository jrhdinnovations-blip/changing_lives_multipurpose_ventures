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
    <section id="welcome-vision" className="py-12 sm:py-16 lg:py-20 bg-[#080d1a] relative overflow-hidden border-t border-white/5 scroll-mt-16">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── TOP HEADER: WELCOME TO CLIMP (DIRECT & CONCISE) ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Welcome to CLIMPS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Welcome to <span className="text-emerald-400">CLIMP</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white/80 block mt-1">
              Changing Lives Multipurpose Cooperative Society
            </span>
          </h2>

          <p className="text-white/70 text-sm sm:text-base lg:text-lg leading-relaxed font-medium max-w-2xl mx-auto mb-6">
            An officially registered Nigerian cooperative society empowering individuals, entrepreneurs, and families to build sustainable wealth through structured savings, pooled high-yield investment circles, and express 24-hour loans.
          </p>

          {/* Trust badges strip — compact on phone */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold text-white/85">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Registered Society</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-extrabold">24-Hour Express Loans</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
              <Coins className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>4% Monthly Savings Growth</span>
            </div>
          </div>
        </div>

        {/* ── OUR VISION & MISSION DUAL CARDS (COMPACT & DIRECT) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          
          {/* VISION CARD */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#0c1a3b] via-[#09142b] to-[#060c1c] border border-indigo-500/30 p-6 sm:p-8 shadow-xl flex flex-col justify-between group hover:border-indigo-400/50 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/40 rounded-full px-3 py-1 text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Our Vision</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-300/80 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">
                  Core Purpose
                </span>
              </div>

              <blockquote className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-snug mb-5">
                &ldquo;To build an ecosystem that empowers people and businesses to{' '}
                <span className="text-emerald-400 underline decoration-indigo-400/40 decoration-2 underline-offset-4">
                  create sustainable wealth, seize opportunities, and change lives.
                </span>
                &rdquo;
              </blockquote>

              {/* Compact Vision Pillars */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <TrendingUp className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <div className="text-[11px] font-black text-white leading-tight">Sustainable Wealth</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <Zap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-[11px] font-black text-white leading-tight">24h Opportunities</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <Users className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                  <div className="text-[11px] font-black text-white leading-tight">Changing Lives</div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">Founded on transparency & mutual trust</span>
              <Link href="/about" className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors">
                Read About Us <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* MISSION & MANDATE CARD */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#07241c] via-[#091b16] to-[#04100c] border border-emerald-500/30 p-6 sm:p-8 shadow-xl flex flex-col justify-between group hover:border-emerald-400/50 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 rounded-full px-3 py-1 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Our Mandate</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-300/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                  Action Plan
                </span>
              </div>

              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-3 leading-snug">
                Transparent Stewardship. Maximum Member Value.
              </h3>

              <div className="space-y-2.5 mb-5">
                {[
                  'Express 24-hour loan turnaround for qualified members',
                  'High-yield savings earning 4% monthly interest (48% p.a.)',
                  'Exclusive Wealth Circle investments with 3.5% monthly payouts',
                  'Annual cooperative surplus profit dividends for all members',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-white/90 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">Open to all qualified members</span>
              <Link href="/register" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                Join CLIMPS Today <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
