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
    <section id="welcome-vision" className="py-16 sm:py-20 lg:py-24 bg-[#070D1E] relative overflow-hidden border-t border-white/10 scroll-mt-16 text-white">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── TOP HEADER: WELCOME TO CLIMPS ── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-[#00E599]" />
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </span>
            <span>Welcome to CLIMPS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Welcome to <span className="text-[#00E599]">CLIMPS</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-300 block mt-1">
              Changing Lives Multipurpose Ventures
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-2xl mx-auto mb-8">
            An officially registered Nigerian multipurpose enterprise empowering individuals, entrepreneurs, and families to build sustainable wealth through structured savings, pooled Wealth Circle investments, and express 24-hour loans.
          </p>

          {/* Trust badges strip */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E599] shrink-0" />
              <span>Registered Multipurpose Ventures</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-rose-400">
              <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-extrabold">24-Hour Express Loans</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-blue-400">
              <Coins className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>4% Monthly Savings Growth</span>
            </div>
          </div>
        </div>

        {/* ── OUR VISION & MISSION DUAL CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* VISION CARD */}
          <div className="relative rounded-3xl bg-[#0D182E]/90 border border-blue-500/20 p-6 sm:p-8 shadow-2xl flex flex-col justify-between group hover:border-blue-500/40 transition-all backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Our Vision</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                  Core Purpose
                </span>
              </div>

              <blockquote className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-snug mb-5">
                &ldquo;To build an ecosystem that empowers people and businesses to{' '}
                <span className="text-[#00E599] underline decoration-emerald-500/30 decoration-2 underline-offset-4">
                  create sustainable wealth, seize opportunities, and change lives.
                </span>
                &rdquo;
              </blockquote>

              {/* Compact Vision Pillars */}
              <div className="grid grid-cols-3 gap-2.5 pt-5 border-t border-white/10 text-center">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <TrendingUp className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                  <div className="text-[11px] font-bold text-slate-200 leading-tight">Sustainable Wealth</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Zap className="w-4 h-4 text-[#00E599] mx-auto mb-1.5" />
                  <div className="text-[11px] font-bold text-slate-200 leading-tight">24h Opportunities</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
                  <div className="text-[11px] font-bold text-slate-200 leading-tight">Changing Lives</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Founded on transparency & mutual trust</span>
              <Link href="/about" className="text-xs font-bold text-[#00E599] hover:text-emerald-300 flex items-center gap-1 transition-colors">
                Read About Us <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* MISSION & MANDATE CARD */}
          <div className="relative rounded-3xl bg-[#0D182E]/90 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl flex flex-col justify-between group hover:border-emerald-500/40 transition-all backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-[#00E599]" />
                  <span>Our Mandate</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                  Action Plan
                </span>
              </div>

              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-4 leading-snug">
                Transparent Stewardship. Maximum Member Value.
              </h3>

              <div className="space-y-3 mb-5">
                {[
                  'Express 24-hour loan turnaround for qualified members',
                  'Savings earning 4% monthly interest (48% p.a.)',
                  'Exclusive Wealth Circle investments with 3.5% monthly returns',
                  'Annual surplus profit dividends for all members',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#00E599] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Open to all qualified members</span>
              <Link href="/register" className="text-xs font-bold text-[#00E599] hover:text-emerald-300 flex items-center gap-1 transition-colors">
                Join CLIMPS Today <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
