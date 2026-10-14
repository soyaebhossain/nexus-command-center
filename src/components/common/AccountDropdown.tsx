import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Languages, Coins, Sun, Moon, Sparkles, Sliders, 
  Download, Upload, ChevronDown, ChevronRight, UserPlus, ArrowRight
} from 'lucide-react';
import { downloadJSON } from '../../utils/storage';

export const AccountDropdown: React.FC = () => {
  const { 
    activeAccount, currency, setCurrency, lang, setLang, 
    theme, toggleTheme, openAccountModal, openSettingsModal, 
    showToast, tasks, transactions, ruleOf3, mealReminders 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportBackup = () => {
    const data = {
      app: 'NEXUS Life OS',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      account: activeAccount,
      tasks,
      transactions,
      ruleOf3,
      mealReminders
    };
    downloadJSON(`nexus_backup_${new Date().toISOString().split('T')[0]}.json`, data);
    showToast('Full offline backup downloaded!');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The Single Account Pill in Top Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-lime-300 rounded-xl text-xs font-semibold text-gray-200 hover:text-white transition-all flex items-center gap-2 shadow-sm"
        title="Account, Preferences & System Settings"
      >
        <span className="text-sm">{activeAccount.avatar || '👤'}</span>
        <span className="font-bold max-w-[110px] truncate text-xs">{activeAccount.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-lime-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0c0e14]/98 backdrop-blur-2xl border border-gray-800 rounded-2xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          {/* 1. Profile Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeAccount.avatar || '👤'}</span>
              <div>
                <h4 className="text-xs font-bold text-gray-100">{activeAccount.name}</h4>
                <span className="text-[10px] font-mono text-lime-300 uppercase tracking-wider">
                  {activeAccount.role.toUpperCase()} WORKSPACE
                </span>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); openAccountModal(); }}
              className="text-[11px] font-semibold text-lime-300 hover:underline flex items-center gap-1"
            >
              <span>Switch / +Add</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 2. Quick Toggles: Language, Currency, Theme, Pro Plan */}
          <div className="space-y-3 text-xs">
            {/* Language Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-lime-300" />
                <span>Language (ভাষা)</span>
              </span>
              <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${lang === 'bn' ? 'bg-lime-400/10 text-lime-300' : 'text-gray-400 hover:text-white'}`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${lang === 'en' ? 'bg-lime-400/10 text-lime-300' : 'text-gray-400 hover:text-white'}`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Currency (মুদ্রা)</span>
              </span>
              <div className="flex items-center gap-0.5 bg-gray-900 border border-gray-800 p-0.5 rounded-lg font-mono">
                {(['৳', '$', '€', '£'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${currency === c ? 'bg-lime-300 text-gray-950 font-extrabold' : 'text-gray-400 hover:text-white'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-cyan-300" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
                <span>Appearance (থিম)</span>
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-2.5 py-1 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg text-[11px] font-medium text-gray-300 flex items-center gap-1"
              >
                {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>

            {/* SaaS Subscription Tier */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-lime-300" />
                <span>SaaS Plan</span>
              </span>
              <button
                type="button"
                onClick={() => { setIsOpen(false); showToast('Pro Plan: Lifetime Workspace Active'); }}
                className="px-2.5 py-1 bg-gradient-to-r from-amber-500/10 to-lime-500/10 border border-lime-300/40 rounded-lg text-[11px] font-bold text-lime-300 hover:border-lime-300 transition-colors flex items-center gap-1"
              >
                <span>Pro Tier ($9)</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 3. System Preferences & Backup Actions */}
          <div className="pt-3 border-t border-gray-800 space-y-1 text-xs">
            <button
              type="button"
              onClick={() => { setIsOpen(false); openSettingsModal(); }}
              className="w-full py-2 px-2.5 rounded-xl hover:bg-gray-900 text-gray-300 hover:text-white font-medium flex items-center gap-2 text-left transition-colors"
            >
              <Sliders className="w-4 h-4 text-lime-300" />
              <span>Workspace Preferences & Modules</span>
            </button>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-2 px-2.5 rounded-xl hover:bg-gray-900 text-gray-300 hover:text-white font-medium flex items-center gap-2 text-left transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Download Full Backup (.json)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
