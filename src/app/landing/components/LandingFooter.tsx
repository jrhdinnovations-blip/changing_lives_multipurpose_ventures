'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, ShieldCheck } from 'lucide-react';

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0f1e] border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
                alt="CLIMPS Logo"
                width={42}
                height={42}
                className="rounded-xl object-cover ring-2 ring-white/15"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-white text-base">CLIMPS</span>
                <span className="text-[10px] text-white/40 font-medium">Changing Lives Multipurpose Ventures</span>
              </div>
            </div>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed">
              Empowering people and businesses with disciplined thrift savings, high-yield wealth opportunities, cooperative loans, and sustainable economic solutions.
            </p>
            <div className="flex items-center gap-2 text-2xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck size={14} />
              <span>Registered Multipurpose Cooperative Society</span>
            </div>
          </div>

          {/* Office Address */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Our Office Address</p>
            <div className="flex items-start gap-2.5 text-xs text-white/70">
              <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-medium text-white/90">Changing Lives Multipurpose Cooperative</p>
                <p>Behind Deeperlife Bible Church, Rayfield adjacent House 7, Rayfield, Jos, Plateau State</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/70 pt-1">
              <Mail size={15} className="text-emerald-400 shrink-0" />
              <a href="mailto:admin@climps.org" className="hover:text-emerald-400 transition-colors">
                admin@climps.org
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Quick Navigation</p>
            <div className="flex flex-col space-y-2 text-xs text-white/60">
              <Link href="/about" className="hover:text-emerald-400 transition-colors">
                About CLIMPS
              </Link>
              <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                How It Works
              </Link>
              <Link href="/savings-products" className="hover:text-emerald-400 transition-colors">
                Savings Products
              </Link>
              <Link href="/investors-circle" className="hover:text-emerald-400 transition-colors">
                Investors Circle
              </Link>
              <Link href="/loan-products" className="hover:text-emerald-400 transition-colors">
                Loan Products
              </Link>
              <Link href="/login" className="hover:text-emerald-400 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-white/40">
          <p>© {year} CLIMPS Cooperative. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="hover:text-white/70 transition-colors">
              About Us
            </Link>
            <Link href="/" className="hover:text-white/70 transition-colors">
              Privacy
            </Link>
            <Link href="/" className="hover:text-white/70 transition-colors">
              Terms
            </Link>
            <a href="mailto:admin@climps.org" className="hover:text-white/70 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
