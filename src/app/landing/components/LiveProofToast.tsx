'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, TrendingUp, Zap, X, ShieldCheck } from 'lucide-react';

interface ToastItem {
  id: number;
  type: string;
  badgeColor: string;
  icon: any;
  title: string;
  desc: string;
  time: string;
}

const TOAST_EVENTS: ToastItem[] = [
  {
    id: 1,
    type: 'Thrift Savings',
    badgeColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    icon: CheckCircle2,
    title: 'Adaeze O. (Lagos)',
    desc: 'Deposited ₦25,000 into 1-Year Thrift Plan',
    time: '3 mins ago',
  },
  {
    id: 2,
    type: '24h Express Loan',
    badgeColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    icon: Zap,
    title: 'Ibrahim M. (Abuja)',
    desc: 'Approved & received ₦350,000 business facility',
    time: '12 mins ago',
  },
  {
    id: 3,
    type: 'Wealth Circle',
    badgeColor: 'text-[#00E599] bg-emerald-500/15 border-emerald-500/30',
    icon: TrendingUp,
    title: 'Chukwuemeka B. (Enugu)',
    desc: 'Credited 3.5% agreed monthly circle yield',
    time: '24 mins ago',
  },
  {
    id: 4,
    type: 'Target Thrift',
    badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    icon: CheckCircle2,
    title: 'Fatima B. (Kano)',
    desc: 'Reached ₦1,000,000 savings milestone',
    time: '41 mins ago',
  },
  {
    id: 5,
    type: 'New Member',
    badgeColor: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
    icon: ShieldCheck,
    title: 'Oluwaseun A. (Ibadan)',
    desc: 'Completed digital onboarding & activated wallet',
    time: 'Just now',
  },
];

export default function LiveProofToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Initial delay before showing first toast
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 2500);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (dismissed || isPaused) return;

    const interval = setInterval(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % TOAST_EVENTS.length);
        setVisible(true);
      }, 500);
    }, 7500);

    return () => clearInterval(interval);
  }, [dismissed, isPaused]);

  if (dismissed) return null;

  const current = TOAST_EVENTS[index];
  const Icon = current.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-5 left-5 z-40 max-w-[340px] sm:max-w-[380px] transition-all duration-500 ease-out select-none ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative rounded-2xl bg-[#091224]/95 border border-white/15 p-3.5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 flex items-start gap-3">
        {/* Glowing pulse aura */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-transparent rounded-2xl blur-md -z-10 pointer-events-none" />

        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[#00E599]">
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${current.badgeColor}`}>
              {current.type}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              • {current.time}
            </span>
          </div>
          <div className="text-xs font-bold text-white truncate">
            {current.title}
          </div>
          <div className="text-[11px] text-slate-300 leading-snug mt-0.5 line-clamp-2 font-normal">
            {current.desc}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
