'use client';
import React from 'react';
import LandingNav from './components/LandingNav';
import NetworkTicker from './components/NetworkTicker';
import HeroSection from './components/HeroSection';
import WelcomeVisionSection from './components/WelcomeVisionSection';
import ServiceCards from './components/ServiceCards';
import HowItWorks from './components/HowItWorks';
import FeaturedProducts from './components/FeaturedProducts';
import FinancialCalculators from './components/FinancialCalculators';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] overflow-x-hidden">
      <NetworkTicker />
      <LandingNav />
      <HeroSection />
      <WelcomeVisionSection />
      <ServiceCards />
      <HowItWorks />
      <FeaturedProducts />
      <FinancialCalculators />
      <Testimonials />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}



