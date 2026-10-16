'use client';
import React from 'react';
import { PiggyBank, TrendingUp, Zap, ShieldCheck, CheckCircle2, Award } from 'lucide-react';

const LIVE_EVENTS = [
  {
    type: 'THRIFT SAVINGS',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: PiggyBank,
    text: '₦50,000 monthly contribution confirmed',
    sub: 'Lagos Member • 4 mins ago',
  },
  {
    type: 'WEALTH CIRCLE',
    badgeClass: 'bg-emerald-500/15 text-[#00E599] border-emerald-500/30',
    icon: TrendingUp,
    text: '3.5% monthly return distributed',
    sub: 'Tranche Alpha • 12 mins ago',
  },
  {
    type: '24H EXPRESS LOAN',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: Zap,
    text: '₦350,000 SME working capital disbursed',
    sub: 'Approved in 1.8 hrs • Abuja',
  },
  {
    type: 'TARGET SAVINGS',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: Award,
    text: '₦1.2M 1-Year Thrift milestone completed',
    sub: '48% p.a. compound growth earned',
  },
  {
    type: 'VENTURES TRUST',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: ShieldCheck,
    text: 'Audited & Registered Multipurpose Ventures',
    sub: '100% capital asset security',
  },
  {
    type: 'NEW ENROLLMENT',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    icon: CheckCircle2,
    text: 'New Member joined Wealth Circle',
    sub: 'Port Harcourt • 22 mins ago',
  },
];

export default function LiveActivityTicker() {
  const allEvents = [...LIVE_EVENTS, ...LIVE_EVENTS];

  return (
    <div className="relative w-full bg-[#030712] border-b border-white/10 py-3 overflow-hidden select-none">
      {/* Dynamic side fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#030712] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#030712] to-transparent z-10 pointer-events-none" />

      {/* Marquee track */}
      <div className="flex w-max animate-ticker-fast hover:[animation-play-state:paused]">
        {allEvents.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-3 px-6 py-1 mx-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 transition-colors cursor-default"
            >
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${evt.badgeClass}`}>
                <Icon className="w-3 h-3" />
                <span>{evt.type}</span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                {evt.text}
              </span>
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                ({evt.sub})
              </span>
              <span className="text-white/20 text-xs ml-2">✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
