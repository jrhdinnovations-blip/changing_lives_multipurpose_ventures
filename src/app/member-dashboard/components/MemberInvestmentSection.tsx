'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Badge from '@/components/ui/Badge';
import { ChevronRight, Info, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const InvestmentRadialChart = dynamic(() => import('./InvestmentRadialChart'), { ssr: false });

interface MemberInvestmentSectionProps {
  member?: any;
}

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MemberInvestmentSection({ member: memberProp }: MemberInvestmentSectionProps) {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadInvestments();
  }, [user, memberProp]);

  async function loadInvestments() {
    setLoading(true);
    try {
      let member = memberProp;
      if (!member && user) {
        const { data } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        member = data;

        if (!member && user.email) {
          const { data: byEmail } = await supabase
            .from('members')
            .select('*')
            .ilike('email', user.email)
            .maybeSingle();
          member = byEmail;
        }
      }

      if (!member) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('investments')
        .select('*, product:investment_products(*)')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching investments:', error.message);
      } else {
        setInvestments(data || []);
      }
    } catch (e) {
      console.error('Error in loadInvestments:', e);
    } finally {
      setLoading(false);
    }
  }

  const activeInvestments = investments.filter(i => i.investment_status === 'active');
  const totalInvested = activeInvestments.reduce((s, i) => s + (Number(i.amount_invested) || 0), 0);
  const totalProjected = activeInvestments.reduce(
    (s, i) => s + (Number(i.projected_return) || (Number(i.amount_invested) * 1.15) || 0),
    0
  );

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
  const radialData = activeInvestments.slice(0, 5).map((inv, idx) => ({
    name: inv.product?.name || inv.investment_number || `Investment #${idx + 1}`,
    value: Number(inv.amount_invested) || 0,
    fill: colors[idx % colors.length],
  }));

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Investment Portfolio</h2>
          <p className="text-2xs text-slate-500 font-medium">Your active cooperative investments</p>
        </div>
        <Link
          href="/investors-circle"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Investors Circle <ChevronRight size={13} />
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <p className="text-2xs text-emerald-800 font-bold">Total Invested</p>
          <p className="text-base font-black text-emerald-700 font-tabular mt-0.5">{fmt(totalInvested)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-2xs text-blue-800 font-bold flex items-center gap-1">
            Projected Value
            <Info size={10} className="text-blue-600" />
          </p>
          <p className="text-base font-black text-blue-700 font-tabular mt-0.5">{fmt(totalProjected)}</p>
          <p className="text-2xs text-blue-600/80 font-medium">Subject to terms</p>
        </div>
      </div>

      {radialData.length > 0 && <InvestmentRadialChart data={radialData} />}

      {/* Investment list or empty state */}
      {loading ? (
        <div className="space-y-2 py-4">
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : investments.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2.5 shadow-xs">
            <TrendingUp size={18} />
          </div>
          <p className="text-sm font-bold text-slate-900">No Active Investments</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1 mb-3.5 font-medium">
            Grow your cooperative wealth with structured returns from the CLIMPS Investors Circle.
          </p>
          <Link
            href="/investors-circle"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95"
          >
            Explore Opportunities
            <ChevronRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-2 mt-4">
          {investments.map(inv => {
            const productName = inv.product?.name || 'Investment Portfolio';
            const category = inv.product?.category || 'Cooperative Investment';
            const returnRate = inv.product?.projected_return_rate
              ? `${inv.product.projected_return_rate}% p.a.`
              : 'Competitive return';
            const maturityDate = inv.maturity_date
              ? new Date(inv.maturity_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Ongoing';

            return (
              <div
                key={inv.id}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {productName}
                      </p>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {category}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 font-mono font-semibold">{inv.investment_number || 'INV-REF'}</p>
                  </div>
                  <Badge variant={inv.investment_status === 'active' ? 'active' : inv.investment_status === 'matured' ? 'paid' : 'pending'}>
                    {inv.investment_status ? inv.investment_status.charAt(0).toUpperCase() + inv.investment_status.slice(1) : 'Active'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-2xs text-slate-500 font-semibold">Invested</p>
                    <p className="text-xs font-black text-slate-900 font-tabular">
                      {fmt(Number(inv.amount_invested) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-slate-500 font-semibold">Return Rate</p>
                    <p className="text-xs font-black text-emerald-700">
                      {returnRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-slate-500 font-semibold">Matures</p>
                    <p className="text-xs font-bold text-slate-900">{maturityDate}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-2xs text-slate-500 text-center mt-3 px-2 font-medium">
        Returns are based on product terms and cooperative surplus distributions.
      </p>
    </div>
  );
}