'use client';
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import AuthBrandPanel from './AuthBrandPanel';
import DemoCredentials from './DemoCredentials';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [prefillEmail, setPrefillEmail] = useState('');
  const [prefillPassword, setPrefillPassword] = useState('');

  const handleCredentialFill = (email: string, password: string) => {
    setPrefillEmail(email);
    setPrefillPassword(password);
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <AuthBrandPanel />

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <div>
              <span className="font-extrabold text-lg text-emerald-400">CLIMPS</span>
              <p className="text-2xs text-white/50 leading-none">Cooperative Platform</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/[0.06] rounded-2xl p-1 mb-8">
            {(['login', 'signup'] as const).map(tab => (
              <button
                key={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-[#0d1527] text-emerald-400 card-shadow'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {activeTab === 'login' ? (
            <LoginForm prefillEmail={prefillEmail} prefillPassword={prefillPassword} />
          ) : (
            <SignupForm onSwitchToLogin={() => setActiveTab('login')} />
          )}

          <DemoCredentials onFill={handleCredentialFill} />
        </div>
      </div>
    </div>
  );
}