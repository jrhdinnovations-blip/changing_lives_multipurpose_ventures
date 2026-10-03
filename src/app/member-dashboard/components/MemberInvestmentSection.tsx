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
          <h2 className="section-header">Investment Portfolio</h2>
          <p className="text-2xs text-white/50">Your active cooperative investments</p>
        </div>
        <Link
          href="/investors-circle"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-400/80 transition-colors flex items-center gap-1 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-emerald-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Investors Circle <ChevronRight size={13} />
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/[0.04]/40 rounded-xl p-3">
          <p className="text-2xs text-white/50">Total Invested</p>
          <p className="text-base font-bold text-emerald-400 font-tabular mt-0.5">{fmt(totalInvested)}</p>
        </div>
        <div className="bg-blue-500/5 rounded-xl p-3">
          <p className="text-2xs text-white/50 flex items-center gap-1">
            Projected Value
            <Info size={10} className="text-white/50" />
          </p>
          <p className="text-base font-bold text-blue-400 font-tabular mt-0.5">{fmt(totalProjected)}</p>
          <p className="text-2xs text-white/50">Subject to terms</p>
        </div>
      </div>

      {radialData.length > 0 && <InvestmentRadialChart data={radialData} />}

      {/* Investment list or empty state */}
      {loading ? (
        <div className="space-y-2 py-4">
          <div className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
          <div className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
        </div>
      ) : investments.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-emerald-400 mb-2.5">
            <TrendingUp size={18} />
          </div>
          <p className="text-sm font-bold text-white">No Active Investments</p>
          <p className="text-xs text-white/50 max-w-xs mt-1 mb-3.5">
            Grow your cooperative wealth with structured returns from the CLIMPS Investors Circle.
          </p>
          <Link
            href="/investors-circle"
            className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
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
                className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-white truncate">
                        {productName}
                      </p>
                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                        {category}
                      </span>
                    </div>
                    <p className="text-2xs text-white/50 font-mono">{inv.investment_number || 'INV-REF'}</p>
                  </div>
                  <Badge variant={inv.investment_status === 'active' ? 'active' : inv.investment_status === 'matured' ? 'paid' : 'pending'}>
                    {inv.investment_status ? inv.investment_status.charAt(0).toUpperCase() + inv.investment_status.slice(1) : 'Active'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-2xs text-white/50">Invested</p>
                    <p className="text-xs font-semibold text-white font-tabular">
                      {fmt(Number(inv.amount_invested) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-white/50">Return Rate</p>
                    <p className="text-xs font-semibold text-blue-400">
                      {returnRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-white/50">Matures</p>
                    <p className="text-xs font-semibold text-white">{maturityDate}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-2xs text-white/50 text-center mt-3 px-2">
        Returns are based on product terms and cooperative surplus distributions.
      </p>
    </div>
  );
}