'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  UserPlus, Banknote, LayoutGrid, TrendingUp,
  ArrowRight, CheckCircle2, Zap, ChevronRight,
} from 'lucide-react';

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const steps = [
  {
    num: '01',
    iconName: 'UserPlus',
    color: 'from-blue-500 to-blue-700',
    glow: 'rgba(59,130,246,0.3)',
    border: 'border-blue-500/30 hover:border-blue-400/60',
    tag: 'FREE',
    tagColor: 'bg-blue-500/20 text-blue-300',
    title: 'Register & Verify',
    subtitle: 'Takes 2–5 minutes',
    desc: 'Create your free account using your NIN or BVN. Instant digital verification to activate membership.',
    bullets: ['No hidden charges', 'Instant NIN/BVN KYC', '100% secure data'],
    emoji: '👤',
  },
  {
    num: '02',
    iconName: 'Banknote',
    color: 'from-emerald-500 to-emerald-700',
    glow: 'rgba(16,185,129,0.3)',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    tag: 'FLEXIBLE',
    tagColor: 'bg-emerald-500/20 text-emerald-300',
    title: 'Fund Your Wallet',
    subtitle: 'Bank transfer or card',
    desc: 'Top up via dedicated account number, bank transfer, or debit card. Start from as low as ₦5,000.',
    bullets: ['Instant wallet credit', 'Automated tracking', 'Starts at ₦5,000'],
    emoji: '💳',
  },
  {
    num: '03',
    iconName: 'LayoutGrid',
    color: 'from-violet-500 to-violet-700',
    glow: 'rgba(139,92,246,0.3)',
    border: 'border-violet-500/30 hover:border-violet-400/60',
    tag: 'CHOICE',
    tagColor: 'bg-violet-500/20 text-violet-300',
    title: 'Choose Plan or Loan',
    subtitle: 'Save · Invest · Borrow',
    desc: 'Select 4% monthly thrift savings, join the 3.5% Wealth Circle, or apply for an express 24-hour loan.',
    bullets: ['4% monthly savings', '3.5% Wealth Circle', '24-hour express loans'],
    emoji: '🎯',
  },
  {
    num: '04',
    iconName: 'TrendingUp',
    color: 'from-orange-500 to-orange-700',
    glow: 'rgba(249,115,22,0.3)',
    border: 'border-orange-500/30 hover:border-orange-400/60',
    tag: 'RETURNS',
    tagColor: 'bg-orange-500/20 text-orange-300',
    title: 'Earn & Prosper',
    subtitle: 'Monthly returns & dividends',
    desc: 'Watch your wealth compound. Monthly returns credited automatically with complete dashboard visibility.',
    bullets: ['Automated interest credit', 'Annual surplus dividends', 'Real-time statement'],
    emoji: '📈',
  },
];

const iconMap = { UserPlus, Banknote, LayoutGrid, TrendingUp };

export default function HowItWorks() {
  const { ref: stepsRef, visible: stepsVisible } = useInView(0.05);

  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-[#080d1a] relative overflow-hidden border-t border-white/5 scroll-mt-16">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div ref={stepsRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 transition-all duration-700" style={{ opacity: stepsVisible ? 1 : 0, transform: stepsVisible ? 'translateY(0)' : 'translateY(24px)' }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-3">
            Start Earning in <span className="text-emerald-400">4 Easy Steps</span>
          </h2>
          <p className="text-white/60 text-sm sm:text-base font-semibold max-w-xl mx-auto">
            From registration to your first returns — simple, transparent, and fully digital.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          {steps.map((step, i) => {
            const Icon = iconMap[step.iconName as keyof typeof iconMap];
            return (
              <StepCard key={step.num} step={step} index={i} visible={stepsVisible} Icon={Icon} />
            );
          })}
        </div>

        {/* Direct Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4" style={{ opacity: stepsVisible ? 1 : 0, transition: 'opacity 0.7s ease 0.5s' }}>
          <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm tracking-wide transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-500/20 group">
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/how-it-works" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white font-bold text-sm hover:bg-white/5 hover:border-white/35 transition-all duration-150">
            <span>Read Step-by-Step Guide</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

function StepCard({ step, index, visible, Icon }: { step: typeof steps[0]; index: number; visible: boolean; Icon: React.ElementType }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`relative rounded-2xl border bg-white/[0.03] p-5 sm:p-6 flex flex-col gap-3.5 cursor-default transition-all duration-500 ${step.border} group`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
        transitionDelay: `${index * 80}ms`,
        boxShadow: hovered ? `0 0 30px ${step.glow}` : 'none'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl sm:text-4xl font-black text-white/15 leading-none select-none">{step.num}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step.tagColor}`}>{step.emoji} {step.tag}</span>
      </div>

      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      <div>
        <div className="text-white/50 text-xs font-semibold mb-0.5">{step.subtitle}</div>
        <h3 className="text-lg font-bold text-white mb-1.5">{step.title}</h3>
        <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
      </div>

      <ul className="space-y-1.5 mt-auto pt-2 border-t border-white/5">
        {step.bullets.map((b) => (
          <li key={b} className="flex items-center gap-1.5 text-xs text-white/75 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${step.glow}, transparent 70%)`, opacity: hovered ? 1 : 0 }} />
    </div>
  );
}
