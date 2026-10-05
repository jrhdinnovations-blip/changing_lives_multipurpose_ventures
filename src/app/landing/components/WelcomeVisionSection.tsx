'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Eye,
  Target,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  PiggyBank,
  CreditCard,
  CheckCircle2,
  Users,
  Compass,
  Award,
  ChevronRight,
  HelpCircle,
  Clock,
  Coins
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TabItem {
  id: string;
  category: string;
  title: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  image: string;
  stat: string;
  statLabel: string;
  description: string;
  benefits: string[];
  ctaText: string;
  ctaHref: string;
  detailsHref: string;
  icon: any;
}

const TABS: TabItem[] = [
  {
    id: 'savings',
    category: 'SAVINGS & THRIFT',
    title: 'Disciplined Cooperative Savings',
    badge: '4% Monthly (48% p.a.)',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    tagline: 'Cultivate wealth with regular thrift contributions and compound security.',
    image: '/assets/images/climps_save_hero.jpg',
    stat: '4.0%',
    statLabel: 'Monthly Growth (48% p.a.)',
    description:
      'Cultivate disciplined savings through regular monthly contributions, fixed target plans, and emergency safety cushions designed specifically for cooperative members.',
    benefits: [
      'High-yielding 4% monthly interest rate on 1-year maintained balances',
      'Flexible deposits starting from as low as ₦5,000 monthly',
      'Share in annual cooperative surplus profits and dividends',
      'Instant withdrawal options for liquid flexible accounts',
    ],
    ctaText: 'Start Saving Today',
    ctaHref: '/save/start',
    detailsHref: '/savings-products',
    icon: PiggyBank,
  },
  {
    id: 'vision-circle',
    category: 'WEALTH CIRCLE',
    title: 'Exclusive High-Return Investments',
    badge: '3.5% Monthly Return',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    tagline: 'Pooled community capital invested in verified, high-yield assets.',
    image: '/assets/images/climps_invest_hero.jpg',
    stat: '3.5%',
    statLabel: 'Agreed Monthly Return',
    description:
      'Join vetted pooled investment portfolios backed by tangible cooperative assets, real estate projects, and ethical commercial facilities with predictable payouts.',
    benefits: [
      'Fixed 3.5% agreed monthly payout credited to your account',
      'Capital security managed under registered cooperative trustees',
      'Transparent quarterly portfolio performance and audit reports',
      'Flexible investment cycles with automated reinvestment options',
    ],
    ctaText: 'Join Wealth Circle',
    ctaHref: '/investors-circle',
    detailsHref: '/investment-products',
    icon: TrendingUp,
  },
  {
    id: 'loans',
    category: '24-HOUR LOANS',
    title: 'Rapid 24-Hour Express Financing',
    badge: 'Funds in 24 Hours',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    tagline: 'Swift, honest cooperative loans without hidden traps or predatory delays.',
    image: '/assets/images/climps_loan_hero.jpg',
    stat: '24hrs',
    statLabel: 'Turnaround Guarantee',
    description:
      'Need emergency liquidity, business working capital, or school fees funding? Access cooperative credit at transparent 10% monthly rates with disbursement within 24 hours.',
    benefits: [
      'Fast-track approval and fund disbursement within 24 hours',
      'Transparent 10% monthly cooperative interest with zero hidden fees',
      'Flexible tenures from 3 to 24 months tailored to your income',
      'No early repayment penalties and simple renewal terms',
    ],
    ctaText: 'Apply for 24h Loan',
    ctaHref: '/loan-application',
    detailsHref: '/loan-products',
    icon: CreditCard,
  },
];

const NEW_USER_STEPS = [
  {
    step: '01',
    title: 'Create Account in 2 Minutes',
    desc: 'Sign up with your basic details and complete instant identity verification (KYC) to activate your cooperative profile.',
    icon: Users,
    badge: 'Fast & Secure',
  },
  {
    step: '02',
    title: 'Select Your Growth Path',
    desc: 'Choose to start saving from ₦5,000/mo, join the 3.5% Wealth Circle, or apply for an express 24-hour loan.',
    icon: Compass,
    badge: 'Personalized',
  },
  {
    step: '03',
    title: 'Enjoy Cooperative Profits',
    desc: 'Track your daily accruals, receive monthly payouts, and participate in annual surplus dividend distributions.',
    icon: Award,
    badge: 'Shared Prosperity',
  },
];

export default function WelcomeVisionSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('savings');
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];
  const CurrentIcon = currentTab.icon;

  return (
    <section id="welcome-vision" className="py-20 lg:py-28 bg-[#080d1a] relative overflow-hidden border-t border-white/5 scroll-mt-16">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── TOP HEADER: WELCOME TO CLIMP ── */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>Welcome to CLIMPS</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Welcome to <span className="text-emerald-400">CLIMP</span>
            <br className="hidden sm:inline" />
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white/90 block mt-2">
              Changing Lives Multipurpose Cooperative Society
            </span>
          </h2>

          <p className="text-white/75 text-lg sm:text-xl lg:text-2xl leading-relaxed font-medium max-w-3xl mx-auto mb-8">
            An officially registered Nigerian cooperative society dedicated to creating opportunities, building sustainable wealth, and changing lives through structured thrift, 24-hour loans, and investment circles.
          </p>

          {/* Trust badges strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-white/80">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Registered & Regulated Society</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-300 font-extrabold">24-Hour Express Loan Guarantee</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <Coins className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Up to 48% p.a. Savings Interest</span>
            </div>
          </div>
        </div>

        {/* ── OUR VISION & MISSION DUAL CARDS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-stretch">
          
          {/* VISION CARD (7 Cols) */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1a3b] via-[#09142b] to-[#060c1c] border-2 border-indigo-500/30 p-8 sm:p-12 shadow-2xl group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-6 right-8 text-8xl sm:text-9xl font-black text-white/[0.03] select-none pointer-events-none">
              VISION
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/40 rounded-full px-4 py-1.5 text-indigo-300 text-xs sm:text-sm font-black uppercase tracking-widest">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Our Vision</span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-300/80 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  CORE PURPOSE
                </span>
              </div>

              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400/80 block mb-2">
                  The Vision Statement
                </span>
                <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  &ldquo;To build an ecosystem that empowers people and businesses to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-emerald-300 to-teal-300 underline decoration-indigo-400/40 decoration-2 underline-offset-8">
                    create sustainable wealth, seize opportunities, and change lives.
                  </span>
                  &rdquo;
                </blockquote>
              </div>

              {/* Vision Pillars with Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Wealth Creation</div>
                    <div className="text-xs text-white/60 mt-0.5">Sustainable financial independence</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Seizing Opportunity</div>
                    <div className="text-xs text-white/60 mt-0.5">Rapid capital & 24h loans</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Changing Lives</div>
                    <div className="text-xs text-white/60 mt-0.5">Member-first shared profits</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs sm:text-sm font-semibold text-white/70">
                Founded on solidarity, mutual self-help, and transparency.
              </span>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-indigo-300 hover:text-white transition-colors"
              >
                Read society constitution & story
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* MISSION & MANDATE CARD (5 Cols) */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#07241c] via-[#091b16] to-[#04100c] border-2 border-emerald-500/30 p-8 sm:p-12 shadow-2xl flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-6 right-8 text-8xl sm:text-9xl font-black text-white/[0.03] select-none pointer-events-none">
              GOAL
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 rounded-full px-4 py-1.5 text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-widest">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Our Mission & Mandate</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-snug">
                Transparent Stewardship. Maximum Member Value.
              </h3>

              <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-6 font-medium">
                To mobilize cooperative savings, provide ethical 24-hour credit facilities, and prudently invest in productive ventures that guarantee surplus dividends and economic upliftment for every member.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Rapid 24-hour loan disbursement for members',
                  'High-yield savings with up to 48% annual return',
                  'Audited accounts & complete transparency in governance',
                  'Equitable distribution of annual cooperative dividends',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-white/90 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/25"
              >
                Become a CLIMPS Member Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── INTERACTIVE PRODUCT EXPLORER WITH PICTURES & SYMBOLS ── */}
        <div className="bg-[#0b1326] border-2 border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl mb-20">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-emerald-400 mb-2">
                <Sparkles className="w-4 h-4" />
                Interactive Explorer for New Users
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Explore What You Can Do with <span className="text-emerald-400">CLIMPS</span>
              </h3>
            </div>
            <p className="text-white/60 text-sm font-semibold max-w-sm">
              Tap any solution below to preview real benefits, returns, and pictures.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 border-emerald-400/80 shadow-lg shadow-emerald-500/10'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-emerald-500 text-black font-bold' : 'bg-white/5 text-white/70'
                    }`}
                  >
                    <TabIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      {tab.category}
                    </div>
                    <div className={`text-base font-black ${isActive ? 'text-white' : 'text-white/80'}`}>
                      {tab.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display Area with Picture & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#070d1d] border border-white/10 rounded-2xl p-6 sm:p-8">
            
            {/* Left: Image with glowing overlay & stats badge */}
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden group shadow-2xl border border-white/10 min-h-[320px] sm:min-h-[380px]">
              <Image
                src={currentTab.image}
                alt={currentTab.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Floating Stat Pill on Image */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                <CurrentIcon className="w-4 h-4 text-emerald-400" />
                <span>{currentTab.badge}</span>
              </div>

              {/* Bottom Stat Card on Image */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                      {currentTab.stat}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white/70">
                      {currentTab.statLabel}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                    <CurrentIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Detailed Content & Quick Action */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border mb-3 ${currentTab.badgeColor}`}>
                  <CurrentIcon className="w-3.5 h-3.5" />
                  <span>{currentTab.badge}</span>
                </div>

                <h4 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                  {currentTab.title}
                </h4>

                <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  {currentTab.description}
                </p>

                {/* Benefits Bullet List */}
                <div className="space-y-3 mb-8">
                  {currentTab.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-white/90">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <Link
                  href={user ? currentTab.ctaHref : `/login?redirect=${encodeURIComponent(currentTab.ctaHref)}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  <span>{currentTab.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={currentTab.detailsHref}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/15 transition-all duration-200"
                >
                  <span>View Product Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>

        </div>

        {/* ── 3-STEP NEW USER ONBOARDING GUIDE ── */}
        <div className="mb-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest block mb-2">
              HOW TO GET STARTED
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              Start Your Journey in 3 Easy Steps
            </h3>
            <p className="text-white/60 text-sm sm:text-base mt-2 font-medium">
              Simple, transparent, and completely digital onboarding for all cooperative members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NEW_USER_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative rounded-2xl bg-[#0c152a] border border-white/10 p-8 flex flex-col justify-between hover:border-emerald-500/40 transition-colors group shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black text-white/15 font-mono group-hover:text-emerald-400/30 transition-colors">
                      {step.step}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      {step.badge}
                    </span>
                  </div>

                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-black text-white mb-2">{step.title}</h4>
                    <p className="text-sm text-white/65 leading-relaxed font-medium">{step.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <span>Step {idx + 1} of 3</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Help Strip for New Users */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0d1e33] to-blue-950/40 border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white">Have questions before joining?</div>
              <div className="text-xs text-white/60">Our friendly support desk is available to guide you through registration.</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/how-it-works"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-colors shadow-md"
            >
              Sign In / Register
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
