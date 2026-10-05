'use client';
import React from 'react';
import Link from 'next/link';
import { 
  PiggyBank, 
  TrendingUp, 
  CreditCard, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Target,
  MapPin 
} from 'lucide-react';

const SERVICES = [
  {
    icon: PiggyBank,
    label: 'Savings',
    badge: 'Thrift & High-Yield',
    desc: 'Regular cooperative thrift contributions, fixed target goals, and flexible savings products designed to cultivate disciplined wealth creation.',
    color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20',
    href: '/savings-products',
  },
  {
    icon: TrendingUp,
    label: 'Wealth Circle opportunities',
    badge: '3.5% Monthly Returns',
    desc: 'Exclusive pooled investment tranches with agreed monthly returns, capital security, and transparent returns for members.',
    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20',
    href: '/investors-circle',
  },
  {
    icon: CreditCard,
    label: 'Loans',
    badge: 'Disbursed in 24 Hours',
    desc: 'Low-interest cooperative loan packages tailored for emergencies, personal milestones, and working capital needs with flexible repayment.',
    color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20',
    href: '/loan-products',
  },
  {
    icon: Briefcase,
    label: 'Business and financial solutions',
    badge: 'Enterprise Growth',
    desc: 'Strategic business advisory, merchant support facilities, working capital solutions, and financial tools to foster enterprise scalability.',
    color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20',
    href: '/about',
  },
  {
    icon: Users,
    label: 'Other member-focused services as approved by the Society.',
    badge: 'Cooperative Welfare',
    desc: 'Comprehensive member welfare initiatives, dividend distributions, asset acquisition schemes, and empowerment programs authorized by CLIMPS.',
    color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20',
    href: '/about',
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-[#080d1a] relative overflow-hidden border-t border-white/5 scroll-mt-20">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 left-1/4 w-[550px] h-[550px] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[550px] h-[550px] rounded-full bg-blue-500/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">

        {/* Section Header / Intro */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3.5 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">About CLIMPS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight mb-6">
            Changing Lives Multipurpose Cooperative Society{' '}
            <span className="text-emerald-400">(CLIMPS)</span>
          </h2>

          <p className="text-white/70 text-base sm:text-lg lg:text-xl leading-relaxed">
            <strong className="text-white font-semibold">Changing Lives Multipurpose Cooperative Society (CLIMPS)</strong> is a cooperative society that provides savings, wealth Circle, loans and business-oriented financial solutions designed to create opportunities, build wealth and change lives.
          </p>
        </div>

        {/* Core Content Grid: Services & Who Can Join */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">

          {/* Left Column — OUR SERVICES */}
          <div className="lg:col-span-7 bg-[#0d1527] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                    What We Offer
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    OUR SERVICES includes:
                  </h3>
                </div>
                <span className="self-start sm:self-auto text-xs font-medium text-white/50 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  5 Core Solutions
                </span>
              </div>

              <div className="space-y-3.5">
                {SERVICES.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.label}
                      href={service.href}
                      className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-200"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${service.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {service.label}
                          </h4>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/60">
                            {service.badge}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-white/55 leading-relaxed">
                          {service.desc}
                        </p>
                      </div>
                      <div className="self-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0">
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-white/50">
                Explore all active cooperative programs and member benefits.
              </span>
              <Link
                href="/savings-products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View all products
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column — Who Can Join CLIMPS? */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0e214d] via-[#0d1b3e] to-[#091124] border border-blue-500/20 p-6 sm:p-8 flex flex-col justify-between shadow-2xl text-white">
            {/* Background design elements */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-blue-500/10 pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 rounded-full px-3.5 py-1.5 mb-5 text-blue-300 text-xs font-semibold uppercase tracking-widest">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Membership Eligibility
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-snug">
                Who can join CLIMPS?
              </h3>

              <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm mb-6">
                <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                  Individuals who meet CLIMPS membership requirements may apply to become members, subject to the Society&apos;s rules and applicable requirements.
                </p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Membership Requirements & Standards
                </div>
                {[
                  "Meet CLIMPS cooperative membership requirements",
                  "Subject to the Society's rules and applicable requirements",
                  "Identity verification & KYC (BVN, NIN, and valid government ID)",
                  "Dedicated to saving, financial responsibility, and ethical wealth building",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white/85">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 flex">
              <Link
                href="/login"
                className="w-full text-center inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Sign In to Member Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Vision & Mission Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* VISION */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#121c3b] via-[#0d162e] to-[#080d1a] border border-indigo-500/25 p-8 sm:p-10 shadow-2xl group hover:border-indigo-500/40 transition-colors">
            <div className="absolute top-4 right-6 text-7xl sm:text-8xl font-black text-white/[0.03] select-none pointer-events-none">
              VISION
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-400/30 rounded-full px-3.5 py-1.5 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  VISION
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300/70 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Our Outlook
                </span>
              </div>

              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                Our Vision
              </h4>

              <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold leading-snug">
                To build an ecosystem that empowers people and businesses to{' '}
                <span className="text-indigo-300 underline decoration-indigo-400/30 decoration-2 underline-offset-4">
                  create sustainable wealth, seize opportunities, and change lives.
                </span>
              </p>
            </div>
          </div>

          {/* MISSION */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#07251d] via-[#081d18] to-[#080d1a] border border-emerald-500/25 p-8 sm:p-10 shadow-2xl group hover:border-emerald-500/40 transition-colors">
            <div className="absolute top-4 right-6 text-7xl sm:text-8xl font-black text-white/[0.03] select-none pointer-events-none">
              MISSION
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 rounded-full px-3.5 py-1.5 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  MISSION
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300/70 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Our Mandate
                </span>
              </div>

              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                Our Mission
              </h4>

              <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold leading-snug">
                To simplify access to innovative financial and business solutions that enable people and businesses{' '}
                <span className="text-emerald-300 underline decoration-emerald-400/30 decoration-2 underline-offset-4">
                  save, grow, access capital, and build sustainable wealth.
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* Office Address & Secretariat */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-[#0d1527] border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <MapPin size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Our Office Address
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white leading-tight">
                Behind Deeperlife Bible Church, Rayfield adjacent House 7, Rayfield, Jos, Plateau State
              </h4>
              <p className="text-xs text-white/50 mt-1">
                Changing Lives Multipurpose Cooperative Society • Email: <a href="mailto:admin@climps.org" className="text-emerald-400 hover:underline">admin@climps.org</a>
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shrink-0 active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            Sign In
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
