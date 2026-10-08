'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, ShieldCheck, Phone } from 'lucide-react';

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#030712] border-t border-white/10 text-slate-300 relative">
      {/* 4-Color Brand Top Stripe: Red, Green, Blue, White */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-[#00D084] via-blue-500 to-rose-500" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
                alt="CLIMPS Logo"
                width={44}
                height={44}
                className="rounded-xl object-cover ring-2 ring-white/20 shadow-lg"
              />
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-xl tracking-tight">CLIMPS</span>
                  <span className="inline-flex items-center gap-1 ml-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-sm shadow-emerald-500/50" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Changing Lives Multipurpose Ventures</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering people and businesses with disciplined thrift savings, high-yield wealth opportunities, cooperative loans, and sustainable economic solutions.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#00E599] bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-semibold">
              <ShieldCheck size={14} className="text-[#00E599]" />
              <span>Registered Multipurpose Cooperative Society</span>
            </div>
          </div>

          {/* Contact & Office Address */}
          <div className="md:col-span-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-200">Contact & Office Address</p>
            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold text-white">Changing Lives Multipurpose Cooperative</p>
                <p className="text-slate-400 text-xs mt-0.5">Behind Deeperlife Bible Church, Rayfield adjacent House 7, Rayfield, Jos, Plateau State</p>
              </div>
            </div>

            {/* Officer & Phone / WhatsApp / Email */}
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Contact Person:</span>
                <span className="font-bold text-white">Jauro Luka</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <Phone size={15} className="text-[#00E599] shrink-0" />
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  <a href="tel:08144447710" className="hover:text-emerald-400 hover:underline">08144447710</a>
                  <span className="text-slate-600">/</span>
                  <a href="tel:08053331224" className="hover:text-emerald-400 hover:underline">08053331224</a>
                  <a
                    href="https://wa.me/2348144447710"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E599] font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <Mail size={15} className="text-blue-400 shrink-0" />
                <a
                  href="mailto:Changinglivesmultipurpose@gmail.com"
                  className="hover:text-blue-300 font-medium transition-colors break-all"
                >
                  Changinglivesmultipurpose@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-200">Quick Navigation</p>
            <div className="flex flex-col space-y-2.5 text-sm font-medium text-slate-400">
              <Link href="/about" className="hover:text-white transition-colors">
                About CLIMPS
              </Link>
              <Link href="/how-it-works" className="hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="/savings-products" className="hover:text-white transition-colors">
                Savings Products
              </Link>
              <Link href="/investors-circle" className="hover:text-[#00E599] transition-colors">
                Investors Circle
              </Link>
              <Link href="/loan-products" className="hover:text-rose-400 transition-colors">
                Loan Products
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-500">
          <p>© {year} CLIMPS Cooperative. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="hover:text-slate-300 transition-colors">
              About Us
            </Link>
            <Link href="/savings-products" className="hover:text-slate-300 transition-colors">
              Savings
            </Link>
            <Link href="/investors-circle" className="hover:text-slate-300 transition-colors">
              Wealth Circle
            </Link>
            <Link href="/loan-products" className="hover:text-slate-300 transition-colors">
              Loans
            </Link>
            <a href="mailto:Changinglivesmultipurpose@gmail.com" className="hover:text-slate-300 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
