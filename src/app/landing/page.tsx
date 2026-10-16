'use client';
import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import LiveActivityTicker from './components/LiveActivityTicker';
import ServiceCards from './components/ServiceCards';
import HowItWorks from './components/HowItWorks';
import FinancialCalculators from './components/FinancialCalculators';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';
import LiveProofToast from './components/LiveProofToast';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050B17] text-slate-100 overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <LiveActivityTicker />
      <ServiceCards />
      <HowItWorks />
      <FinancialCalculators />
      <Testimonials />
      <FinalCTA />
      <LandingFooter />
      <LiveProofToast />
    </div>
  );
}

