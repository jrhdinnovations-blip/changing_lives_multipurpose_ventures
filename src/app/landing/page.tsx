'use client';
import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import ServiceCards from './components/ServiceCards';
import FeaturedProducts from './components/FeaturedProducts';
import FinancialCalculators from './components/FinancialCalculators';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <ServiceCards />
      <FeaturedProducts />
      <FinancialCalculators />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}

