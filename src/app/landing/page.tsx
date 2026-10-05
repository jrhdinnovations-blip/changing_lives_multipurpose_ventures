'use client';
import React from 'react';
import LandingNav from './components/LandingNav';
import NetworkTicker from './components/NetworkTicker';
import HeroSection from './components/HeroSection';
import WelcomeVisionSection from './components/WelcomeVisionSection';
import ServiceCards from './components/ServiceCards';
import FinancialCalculators from './components/FinancialCalculators';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <NetworkTicker />
      <LandingNav />
      <HeroSection />
      <WelcomeVisionSection />
      <ServiceCards />
      <FinancialCalculators />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
