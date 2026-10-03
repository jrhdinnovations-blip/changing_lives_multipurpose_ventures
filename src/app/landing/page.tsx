'use client';
import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import ServiceCards from './components/ServiceCards';
import AboutSection from './components/AboutSection';
import HowItWorks from './components/HowItWorks';
import FinancialCalculators from './components/FinancialCalculators';
import FeaturedProducts from './components/FeaturedProducts';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <ServiceCards />
      <AboutSection />
      <HowItWorks />
      <FinancialCalculators />
      <FeaturedProducts />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
