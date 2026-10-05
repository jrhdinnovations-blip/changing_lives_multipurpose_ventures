'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, CheckCircle2, PiggyBank, TrendingUp, CreditCard, HelpCircle } from 'lucide-react';
import LandingNav from '../landing/components/LandingNav';
import HowItWorks from '../landing/components/HowItWorks';
import FinalCTA from '../landing/components/FinalCTA';
import LandingFooter from '../landing/components/LandingFooter';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">
      <LandingNav />

      {/* Hero Header */}
      <section className="relative pt-36 pb-16 lg:pt-44 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#0e172e] via-[#091522] to-[#080d1a]">
        {/* Ambient lighting */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-500/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-6">
            <Link href="/landing" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-emerald-400">How It Works</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Simple · Transparent · Member-First
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6 max-w-4xl">
            How CLIMPS Works.<br />
            <span className="text-emerald-400">Your Journey to Financial Growth.</span>
          </h1>

          <p className="text-white/65 text-base sm:text-lg lg:text-xl max-w-3xl leading-relaxed mb-8">
            From registration and onboarding to disciplined savings, lucrative Wealth Circle investments, and low-interest cooperative loans — here is how our ecosystem works for you.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-500/25"
            >
              Sign In to Your Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#steps"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all duration-150"
            >
              Explore the 4 Steps
            </Link>
          </div>
        </div>
      </section>

      {/* 4-Step Interactive Section */}
      <div id="steps">
        <HowItWorks />
      </div>

      {/* Feature Deep Dive */}
      <section className="py-20 lg:py-28 bg-[#0a0f1e] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase block mb-3">
              WHAT YOU CAN DO
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Three Pillars of Member Success
            </h2>
            <p className="text-white/60 text-sm sm:text-base mt-4">
              Once provisioned, members unlock access to all cooperative financial vehicles from a single dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Save Card */}
            <div className="bg-[#0d1527] border border-white/10 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 border border-blue-500/20">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">1. Save Systematically</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Set up monthly thrift contributions or voluntary savings. Maintain your savings for at least 12 months to earn 4% monthly interest on qualifying balances.
                </p>
              </div>
              <Link
                href="/savings-products"
                className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1.5"
              >
                View Savings Products →
              </Link>
            </div>

            {/* Invest Card */}
            <div className="bg-[#0d1527] border border-white/10 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">2. Grow with Wealth Circle</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Participate in CLIMPS Wealth Circle (CWC) earning 3.5% monthly agreed returns. Backed by structured cooperative liquidation protocols and written agreements.
                </p>
              </div>
              <Link
                href="/investment-products"
                className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
              >
                View Wealth Circle Products →
              </Link>
            </div>

            {/* Borrow Card */}
            <div className="bg-[#0d1527] border border-white/10 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">3. Borrow Responsibly</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Access cooperative personal loans at competitive rates. Fast review within 24 hours for active members, with no early repayment penalties.
                </p>
              </div>
              <Link
                href="/loan-products"
                className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5"
              >
                View Loan Products →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA & Footer */}
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
