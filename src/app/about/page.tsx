'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Users, Sparkles } from 'lucide-react';
import LandingNav from '../landing/components/LandingNav';
import AboutSection from '../landing/components/AboutSection';
import FinalCTA from '../landing/components/FinalCTA';
import LandingFooter from '../landing/components/LandingFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">
      <LandingNav />

      {/* Hero Header */}
      <section className="relative pt-36 pb-16 lg:pt-44 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#0e172e] to-[#080d1a]">
        {/* Ambient lighting */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-6">
            <Link href="/landing" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-emerald-400">About Us</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Changing Lives Multipurpose Ventures
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6 max-w-4xl">
            Empowering Members.<br />
            <span className="text-emerald-400">Building Sustainable Wealth.</span>
          </h1>

          <p className="text-white/65 text-base sm:text-lg lg:text-xl max-w-3xl leading-relaxed mb-8">
            Learn about CLIMPS, our core service offerings, membership eligibility guidelines, and our guiding vision and mission.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-500/25"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all duration-150"
            >
              Read Overview
            </Link>
          </div>
        </div>
      </section>

      {/* Main About Component */}
      <AboutSection />

      {/* Final CTA & Footer */}
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
