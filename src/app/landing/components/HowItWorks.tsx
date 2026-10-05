'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserPlus, Banknote, LayoutGrid, TrendingUp,
  ArrowRight, CheckCircle2, Shield, Clock, Star,
  PiggyBank, Zap, Users, BadgeCheck, ChevronRight,
} from 'lucide-react';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
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
    subtitle: 'Takes less than 5 minutes',
    desc: 'Create your free account using your NIN or BVN. Our team verifies and activates your membership within 24 hours.',
    bullets: ['No hidden fees', 'NIN / BVN verification', '100% secure'],
    emoji: '🆓',
  },
  {
    num: '02',
    iconName: 'Banknote',
    color: 'from-emerald-500 to-emerald-700',
    glow: 'rgba(16,185,129,0.3)',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    tag: 'EASY',
    tagColor: 'bg-emerald-500/20 text-emerald-300',
    title: 'Fund Your Wallet',
    subtitle: 'Multiple payment options',
    desc: 'Top up via bank transfer, USSD code, or debit card. Funds reflect instantly — start contributing from as low as ₦5,000.',
    bullets: ['Bank transfer or USSD', 'Instant confirmation', 'From ₦5,000'],
    emoji: '💸',
  },
  {
    num: '03',
    iconName: 'LayoutGrid',
    color: 'from-violet-500 to-violet-700',
    glow: 'rgba(139,92,246,0.3)',
    border: 'border-violet-500/30 hover:border-violet-400/60',
    tag: 'FLEXIBLE',
    tagColor: 'bg-violet-500/20 text-violet-300',
    title: 'Choose Your Product',
    subtitle: 'Save · Grow · Borrow',
    desc: 'Pick the plan that fits your goals. Open savings, join the Wealth Circle investment pool, or apply for a cooperative loan.',
    bullets: ['Savings accounts', 'Wealth Circle investment', 'Cooperative loans'],
    emoji: '🎯',
  },
  {
    num: '04',
    iconName: 'TrendingUp',
    color: 'from-orange-500 to-orange-700',
    glow: 'rgba(249,115,22,0.3)',
    border: 'border-orange-500/30 hover:border-orange-400/60',
    tag: 'MONTHLY',
    tagColor: 'bg-orange-500/20 text-orange-300',
    title: 'Earn & Grow',
    subtitle: 'Returns credited monthly',
    desc: 'Watch your money grow. Returns and dividends are credited every month, with full statements available in your dashboard.',
    bullets: ['4% monthly returns', 'Monthly statements', 'Dashboard access'],
    emoji: '📈',
  },
];

const panels = [
  {
    id: 'save',
    label: 'SAVE',
    color: 'bg-[#0d1b4b]',
    accent: 'text-blue-400',
    rate: '4%',
    rateLabel: 'Monthly interest',
    headline: 'Build a safety net that works while you sleep',
    desc: 'Open a cooperative savings account and earn guaranteed 4% monthly interest. Perfect for building emergency funds, goals, or retirement.',
    img: '/assets/images/climps_save_hero.jpg',
    badge: '🔒 NDIC Insured',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    href: '/savings-products',
    features: ['₦5,000 min monthly', '12-month tenure', 'No hidden charges'],
    featureColor: 'text-blue-300',
  },
  {
    id: 'grow',
    label: 'INVEST',
    color: 'bg-[#0a1f0f]',
    accent: 'text-emerald-400',
    rate: '3.5%',
    rateLabel: 'Monthly agreed return',
    headline: 'Join the Wealth Circle — money working for you',
    desc: 'Pool resources with thousands of members in the CLIMPS Wealth Circle. Earn 3.5% monthly on your subscribed capital, agreed upfront.',
    img: '/assets/images/climps_invest_hero.jpg',
    badge: '🤝 Member-owned',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    href: '/investment-products',
    features: ['₦50,000 min entry', 'Agreed fixed return', 'Monthly payout'],
    featureColor: 'text-emerald-300',
  },
  {
    id: 'borrow',
    label: 'BORROW',
    color: 'bg-[#1f0e02]',
    accent: 'text-orange-400',
    rate: '24hrs',
    rateLabel: 'Loan disbursement',
    headline: 'Fast funds, no stress — approved in 24 hours',
    desc: 'Need money urgently? CLIMPS cooperative loans are disbursed within 24 hours. No collateral for existing members. Flexible repayment.',
    img: '/assets/images/climps_loan_hero.jpg',
    badge: '⚡ Fast approval',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    href: '/loan-products',
    features: ['No collateral needed', '24-hr disbursement', 'Flexible tenure'],
    featureColor: 'text-orange-300',
  },
];

const trustStats = [
  { val: '12,400+', label: 'Active Members', color: 'text-emerald-400', emoji: '👥' },
  { val: '₦2.4B+', label: 'Funds Managed', color: 'text-blue-400', emoji: '💰' },
  { val: '4.9/5', label: 'Member Rating', color: 'text-amber-400', emoji: '⭐' },
  { val: 'CAC Reg.', label: 'Government Approved', color: 'text-violet-400', emoji: '🏛️' },
];

const iconMap = { UserPlus, Banknote, LayoutGrid, TrendingUp };

export default function HowItWorks() {
  const { ref: stepsRef, visible: stepsVisible } = useInView(0.05);
  const { ref: panelsRef, visible: panelsVisible } = useInView(0.05);
  const { ref: trustRef, visible: trustVisible } = useInView(0.1);

  return (
    <>
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#0a0f1e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <div ref={stepsRef} className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16 transition-all duration-700" style={{ opacity: stepsVisible ? 1 : 0, transform: stepsVisible ? 'translateY(0)' : 'translateY(30px)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-bold tracking-wide mb-6">
              <Zap className="w-4 h-4" />
              NEW USER GUIDE — START HERE
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-5">
              Start earning in{' '}
              <span className="text-emerald-400">4 easy steps</span>
            </h2>
            <p className="text-white/60 text-xl font-semibold max-w-2xl mx-auto leading-relaxed">
              From registration to your first return — simple, fast, and fully digital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {steps.map((step, i) => {
              const Icon = iconMap[step.iconName as keyof typeof iconMap];
              return (
                <StepCard key={step.num} step={step} index={i} visible={stepsVisible} Icon={Icon} />
              );
            })}
          </div>

          <div className="hidden lg:flex items-center justify-center gap-2 mb-12" style={{ opacity: stepsVisible ? 1 : 0, transition: 'opacity 0.7s ease 0.7s' }}>
            {['Register', 'Fund', 'Choose', 'Earn'].map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{label}</span>
                </div>
                {i < 3 && <div className="flex-1 h-px bg-gradient-to-r from-emerald-400/40 to-emerald-400/40 mx-2" />}
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ opacity: stepsVisible ? 1 : 0, transition: 'opacity 0.7s ease 0.8s' }}>
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/25 group">
              Get Started Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-bold text-base hover:bg-white/5 hover:border-white/35 transition-all duration-200">
              Full Guide
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0d1117] border-y border-white/10 py-10">
        <div ref={trustRef} className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {trustStats.map(({ val, label, color, emoji }, i) => (
              <div key={label} className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left transition-all duration-700" style={{ opacity: trustVisible ? 1 : 0, transform: trustVisible ? 'translateY(0)' : 'translateY(20px)', transitionDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-2xl">
                  {emoji}
                </div>
                <div>
                  <div className={`text-2xl font-black ${color}`}>{val}</div>
                  <div className="text-white/50 text-sm font-semibold">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[#080c18] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div ref={panelsRef} className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 text-center transition-all duration-700" style={{ opacity: panelsVisible ? 1 : 0, transform: panelsVisible ? 'translateY(0)' : 'translateY(30px)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-white/60 text-sm font-bold tracking-wide mb-6">
              <Shield className="w-4 h-4 text-emerald-400" />
              THREE WAYS TO BUILD WEALTH
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Your goals, our{' '}
              <span className="text-emerald-400">financial products</span>
            </h2>
            <p className="text-white/55 text-xl font-semibold max-w-xl mx-auto">
              Real people, real results — see how each product changes lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {panels.map((panel, i) => (
              <ServicePanel key={panel.id} panel={panel} index={i} visible={panelsVisible} />
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 transition-all duration-700" style={{ opacity: panelsVisible ? 1 : 0, transitionDelay: '600ms' }}>
            {[
              { emoji: '🛡️', text: 'CAC Registered & NDIC Insured', color: 'text-emerald-400' },
              { emoji: '⚡', text: 'Loan disbursed in 24 hours', color: 'text-orange-400' },
              { emoji: '💰', text: '4% monthly interest, guaranteed', color: 'text-blue-400' },
            ].map(({ emoji, text, color }) => (
              <div key={text} className="flex items-center gap-2.5">
                <span className="text-xl">{emoji}</span>
                <span className={`text-base font-semibold ${color}`}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function StepCard({ step, index, visible, Icon }: { step: typeof steps[0]; index: number; visible: boolean; Icon: React.ElementType }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`relative rounded-2xl border bg-white/[0.04] p-7 flex flex-col gap-4 cursor-default transition-all duration-500 ${step.border} group`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)', transitionDelay: `${index * 120}ms`, boxShadow: hovered ? `0 0 40px ${step.glow}` : 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span className="text-5xl font-black text-white/10 leading-none select-none">{step.num}</span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${step.tagColor}`}>{step.emoji} {step.tag}</span>
      </div>
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <div className="text-white/50 text-sm font-semibold mb-1">{step.subtitle}</div>
        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-white/60 text-base leading-relaxed">{step.desc}</p>
      </div>
      <ul className="space-y-1.5 mt-auto">
        {step.bullets.map((b) => (
          <li key={b} className="flex items-center gap-2 text-sm text-white/70">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>
      <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${step.glow}, transparent 70%)`, opacity: hovered ? 1 : 0 }} />
    </div>
  );
}

function ServicePanel({ panel, index, visible }: { panel: typeof panels[0]; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-white/10 flex flex-col transition-all duration-700 group cursor-pointer hover:border-white/25 hover:scale-[1.02]"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : `translateY(${40 + index * 10}px)`, transitionDelay: `${index * 180}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <Image src={panel.img} alt={panel.headline} fill className={`object-cover transition-transform duration-700 ${hovered ? 'scale-110' : 'scale-100'}`} sizes="(max-width: 768px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 border border-white/15">
            <div className={`text-3xl font-black ${panel.accent}`}>{panel.rate}</div>
            <div className="text-white/60 text-xs font-semibold">{panel.rateLabel}</div>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${panel.badgeClass} backdrop-blur-md bg-black/40`}>{panel.label}</span>
        </div>
      </div>
      <div className={`${panel.color} flex flex-col flex-1 p-7 gap-4`}>
        <span className={`inline-flex self-start text-xs font-bold px-3 py-1.5 rounded-full border ${panel.badgeClass}`}>{panel.badge}</span>
        <h3 className="text-xl font-bold text-white leading-snug">{panel.headline}</h3>
        <p className="text-white/65 text-base leading-relaxed">{panel.desc}</p>
        <ul className="space-y-1.5">
          {panel.features.map((f) => (
            <li key={f} className={`flex items-center gap-2 text-sm font-semibold ${panel.featureColor}`}>
              <span className="text-base">✓</span> {f}
            </li>
          ))}
        </ul>
        <Link href={panel.href} className={`inline-flex items-center gap-2 mt-auto pt-2 font-bold text-base ${panel.accent} group/cta hover:underline transition-all`}>
          Learn more
          <ChevronRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
