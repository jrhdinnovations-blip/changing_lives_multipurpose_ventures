import React from 'react';
import Image from 'next/image';
import { ShieldCheck, TrendingUp, PiggyBank, Award, Lock } from 'lucide-react';

const stats = [
  { id: 'stat-members', label: 'Active Members', value: '2,847' },
  { id: 'stat-savings', label: 'Total Savings', value: '₦1.4B' },
  { id: 'stat-loans', label: 'Loans Disbursed', value: '₦892M' },
  { id: 'stat-returns', label: 'Investment Returns', value: '₦124M' },
];

const features = [
  { id: 'feat-save', icon: PiggyBank, text: 'Flexible savings with competitive returns' },
  { id: 'feat-invest', icon: TrendingUp, text: 'Curated investment products for every goal' },
  { id: 'feat-borrow', icon: Award, text: 'Fast, affordable cooperative loans' },
  { id: 'feat-secure', icon: Lock, text: 'Bank-grade security & full transparency' },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex w-[480px] xl:w-[560px] shrink-0 gradient-primary flex-col justify-between p-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-10 w-32 h-32 rounded-full bg-white/5" />
      </div>

      {/* Top: Logo + tagline */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center overflow-hidden">
            <Image
              src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
              alt="CLIMPS Logo"
              width={48}
              height={48}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-2xl tracking-tight leading-none">CLIMPS</h1>
            <p className="text-white/60 text-xs mt-0.5">Changing Lives Multipurpose Ventures</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-white font-bold text-3xl leading-tight mb-3">
            Save. Invest.<br />Borrow. Grow.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Build your financial future with Nigeria&apos;s most trusted cooperative platform.
            Manage savings, investments, and loans — all in one place.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {features?.map(f => (
            <div key={f?.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <f.icon size={16} className="text-white" />
              </div>
              <p className="text-white/80 text-sm">{f?.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats?.map(s => (
            <div key={s?.id} className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-white font-bold text-xl font-tabular">{s?.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s?.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-green-400" />
          <p className="text-white/60 text-xs">
            Licensed cooperative • CBN compliant • Member funds secured
          </p>
        </div>
      </div>
    </div>
  );
}