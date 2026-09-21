'use client';
import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import ServiceCards from './components/ServiceCards';
import HowItWorks from './components/HowItWorks';
import FinancialCalculators from './components/FinancialCalculators';
import FeaturedProducts from './components/FeaturedProducts';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <ServiceCards />
      <HowItWorks />
      <FinancialCalculators />
      <FeaturedProducts />
      <Testimonials />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
