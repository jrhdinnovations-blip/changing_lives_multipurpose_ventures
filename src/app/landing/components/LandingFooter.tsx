'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingFooter() {
  const year = 2026;

  return (
    <footer className="bg-foreground text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
                alt="CLIMPS Cooperative Logo"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
              <span className="font-bold text-white text-base">CLIMPS</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Nigeria's trusted financial cooperative. Empowering members since 1998.
            </p>
            <div className="text-xs text-white/40">
              RC: 1234567 | CAC Registered<br />
              NDIC Member Institution
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {['Savings Plans', 'Investment Portfolios', 'Loan Products', 'Member Benefits']?.map((item) => (
                <li key={item}>
                  <Link href="/" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {['About CLIMPS', 'Board of Directors', 'Annual Reports', 'Careers', 'Contact Us']?.map((item) => (
                <li key={item}>
                  <Link href="/" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li>📞 +234 800 CLIMPS</li>
              <li>✉️ support@climps.ng</li>
              <li>📍 Lagos, Abuja, Port Harcourt</li>
              <li className="pt-1">
                <span className="text-xs text-white/40">Mon–Fri: 8am – 6pm WAT</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {year} CLIMPS Cooperative Society. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <Link href="/" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white/70 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-white/70 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
