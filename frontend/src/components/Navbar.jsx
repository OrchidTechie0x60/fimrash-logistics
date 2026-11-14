import React from 'react';
import { Package, Truck, Search, Banknote, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeDeliveriesCount }) {
  const tabs = [
    { id: 'booking', label: 'Book Dispatch', icon: Package, badge: null },
    { id: 'tracking', label: 'Track Waybill', icon: Search, badge: null },
    { id: 'rider', label: 'Rider Console', icon: Truck, badge: activeDeliveriesCount > 0 ? activeDeliveriesCount : null },
    { id: 'ledger', label: 'COD Reconciliation', icon: Banknote, badge: 'Live' }
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('booking')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
              F
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">FIMRASH</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  KANO METRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Logistics & Anti-Theft COD Settlement</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Secure Handshake Badge */}
          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>4-Digit Anti-Theft OTP Active</span>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800/80 -mx-4 px-4 space-x-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800/60 text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1 bg-emerald-950 text-emerald-300 rounded font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
