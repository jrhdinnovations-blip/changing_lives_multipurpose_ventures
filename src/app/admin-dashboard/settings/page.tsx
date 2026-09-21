'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';

interface Setting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

const SETTING_GROUPS = [
  {
    id: 'loan',
    title: 'Loan Configuration',
    icon: '💳',
    color: 'emerald',
    keys: [
      { key: 'loan_processing_fee_percent', label: 'Processing Fee (%)', type: 'number', hint: '1% of loan amount charged upfront' },
      { key: 'loan_interest_rate_percent', label: 'Monthly Interest Rate (%)', type: 'number', hint: '10% monthly interest on principal' },
      { key: 'loan_default_fee_percent_daily', label: 'Daily Default Fee on Unpaid Interest (%)', type: 'number', hint: '1% daily on unpaid interest after due date' },
      { key: 'loan_overdue_threshold_days', label: 'Overdue Threshold (Days)', type: 'number', hint: 'Interest unpaid beyond this is overdue (15 days)' },
      { key: 'loan_prorata_days', label: 'Pro-Rata Calculation Period (Days)', type: 'number', hint: 'Payments within this period use pro-rata (14 days)' },
      { key: 'loan_durations_months', label: 'Available Loan Durations (months, comma-separated)', type: 'text', hint: 'e.g. 1,2,3' },
      { key: 'loan_guarantor_required', label: 'Guarantor Required', type: 'boolean', hint: 'Whether a guarantor is mandatory' },
      { key: 'loan_collateral_required', label: 'Collateral Required', type: 'boolean', hint: 'Whether collateral is mandatory' },
      { key: 'loan_terms_version', label: 'Loan Terms Version', type: 'text', hint: 'Current version of loan terms' },
      { key: 'loan_agreement_version', label: 'Loan Agreement Version', type: 'text', hint: 'Current version of loan agreement' },
    ],
  },
  {
    id: 'investment',
    title: 'Investment Configuration',
    icon: '📈',
    color: 'blue',
    keys: [
      { key: 'investors_circle_min_amount', label: 'Minimum Investment Amount (₦)', type: 'number', hint: 'Minimum investment: ₦750,000' },
      { key: 'investors_circle_processing_fee', label: 'Processing/Administrative Fee (₦)', type: 'number', hint: 'Fixed fee: ₦3,000' },
      { key: 'investors_circle_interest_rate', label: 'Monthly Return Rate (%)', type: 'number', hint: '4% of capital per month' },
      { key: 'investors_circle_coop_account_name', label: 'Cooperative Account Name', type: 'text', hint: 'Name on cooperative bank account' },
      { key: 'investors_circle_coop_account_number', label: 'Cooperative Account Number', type: 'text', hint: 'Bank account number for receiving investments' },
      { key: 'investors_circle_coop_bank_name', label: 'Cooperative Bank Name', type: 'text', hint: 'Bank where cooperative account is held' },
    ],
  },
  {
    id: 'general',
    title: 'General Settings',
    icon: '⚙️',
    color: 'gray',
    keys: [
      { key: 'cooperative_name', label: 'Cooperative Name', type: 'text', hint: 'Full legal name of the cooperative' },
      { key: 'cooperative_address', label: 'Cooperative Address', type: 'text', hint: 'Registered address' },
      { key: 'cooperative_phone', label: 'Contact Phone', type: 'text', hint: 'Main contact number' },
      { key: 'cooperative_email', label: 'Contact Email', type: 'text', hint: 'Main contact email' },
    ],
  },
];

export default function AdminSettingsPage() {
  const { user, isAdmin } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeGroup, setActiveGroup] = useState('loan');

  useEffect(() => {
    if (!isAdmin) return;
    loadSettings();
  }, [isAdmin]);

  async function loadSettings() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value, description');
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.setting_key] = r.setting_value || ''; });
        setSettings(map);
        setEditValues(map);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSetting(key: string) {
    setSaving(s => ({ ...s, [key]: true }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
    try {
      const value = editValues[key] ?? '';
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'setting_key' });
      if (error) throw error;
      setSettings(s => ({ ...s, [key]: value }));
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000);
    } catch (err: any) {
      setErrors(e => ({ ...e, [key]: err?.message || 'Save failed.' }));
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  }

  async function saveGroup(groupId: string) {
    const group = SETTING_GROUPS.find(g => g.id === groupId);
    if (!group) return;
    for (const item of group.keys) {
      await saveSetting(item.key);
    }
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Access denied. Admin privileges required.</p>
        </div>
      </AppLayout>
    );
  }

  const currentGroup = SETTING_GROUPS.find(g => g.id === activeGroup);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure financial rules and cooperative settings</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-52 shrink-0 space-y-1">
              {SETTING_GROUPS.map(group => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeGroup === group.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{group.icon}</span>
                  {group.title}
                </button>
              ))}
            </div>

            {/* Settings Panel */}
            {currentGroup && (
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900">{currentGroup.icon} {currentGroup.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Changes take effect immediately for new applications</p>
                  </div>
                  <button
                    onClick={() => saveGroup(currentGroup.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                  >
                    Save All
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {currentGroup.keys.map(item => {
                    const currentVal = editValues[item.key] ?? '';
                    const hasChanged = currentVal !== (settings[item.key] ?? '');
                    return (
                      <div key={item.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-gray-700">{item.label}</label>
                          {hasChanged && (
                            <span className="text-xs text-orange-500 font-medium">Unsaved changes</span>
                          )}
                          {saved[item.key] && (
                            <span className="text-xs text-emerald-600 font-medium">✓ Saved</span>
                          )}
                        </div>
                        {item.hint && <p className="text-xs text-gray-400">{item.hint}</p>}
                        <div className="flex gap-2">
                          {item.type === 'boolean' ? (
                            <div className="flex gap-2 flex-1">
                              {['true', 'false'].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => setEditValues(v => ({ ...v, [item.key]: opt }))}
                                  className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                                    currentVal === opt
                                      ? opt === 'true' ?'border-emerald-500 bg-emerald-50 text-emerald-700' :'border-red-400 bg-red-50 text-red-700' :'border-gray-200 text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  {opt === 'true' ? '✓ Yes' : '✗ No'}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <input
                              type={item.type === 'number' ? 'number' : 'text'}
                              value={currentVal}
                              onChange={e => setEditValues(v => ({ ...v, [item.key]: e.target.value }))}
                              className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                                errors[item.key] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-emerald-400'
                              }`}
                            />
                          )}
                          <button
                            onClick={() => saveSetting(item.key)}
                            disabled={saving[item.key] || !hasChanged}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-40 shrink-0"
                          >
                            {saving[item.key] ? '...' : 'Save'}
                          </button>
                        </div>
                        {errors[item.key] && (
                          <p className="text-red-500 text-xs">{errors[item.key]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current Values Reference */}
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Current Saved Values</p>
                    <div className="grid grid-cols-2 gap-2">
                      {currentGroup.keys.map(item => (
                        <div key={item.key} className="text-xs">
                          <span className="text-gray-400">{item.label}: </span>
                          <span className="font-medium text-gray-700">{settings[item.key] || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
