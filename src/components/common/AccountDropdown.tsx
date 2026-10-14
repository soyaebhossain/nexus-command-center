import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Languages, Coins, Sun, Moon, Sparkles, Settings as SettingsIcon, 
  Download, ChevronRight, ArrowRight, Database, Award 
} from 'lucide-react';
import { downloadJSON } from '../../utils/storage';
import { useTranslation } from '../../utils/i18n';
import { calculateProfileCompletion } from '../../utils/profile';

export const AccountDropdown: React.FC = () => {
  const { 
    activeAccount, currency, setCurrency, lang, setLang, 
    theme, toggleTheme, openAccountModal, openSettingsModal, openProfileWizard,
    showToast, tasks, transactions, ruleOf3, mealReminders, loadDemoData 
  } = useApp();


  const t = useTranslation(lang);
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
    showToast(t.backupToast);
    setIsOpen(false);
  };

  const isLight = theme === 'light';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Far Right: ONLY 👤 Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-base hover:scale-105 active:scale-95 transition-all shadow-md relative ${
          isLight 
            ? 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800' 
            : 'bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-lime-400 text-gray-100'
        }`}
        title={t.workspace}
        aria-label={t.workspace}
      >
        <span>{activeAccount.avatar || '👤'}</span>
        {/* Subtle active indicator dot */}
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
          isLight ? 'bg-lime-500 border-white' : 'bg-lime-400 border-[#0b0d12]'
        }`}></span>
      </button>

      {/* Floating Dropdown Drawer */}
      {isOpen && (
        <div className={`absolute right-0 top-12 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl border ${
          isLight
            ? 'bg-white/98 text-slate-800 border-slate-200 shadow-slate-300/50'
            : 'bg-[#0c0e14]/98 text-gray-100 border-gray-800 shadow-2xl'
        }`}>
          {/* 1. Profile Identity Header */}
          <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeAccount.avatar || '👤'}</span>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-gray-100'}`}>{activeAccount.name}</h4>
                <span className={`text-[10px] font-mono uppercase tracking-wider ${isLight ? 'text-lime-700 font-bold' : 'text-lime-300'}`}>
                  {activeAccount.role.toUpperCase()} {t.workspace.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); openAccountModal(); }}
              className={`text-[11px] font-semibold flex items-center gap-1 ${isLight ? 'text-lime-700 hover:text-lime-900' : 'text-lime-300 hover:underline'}`}
            >
              <span>{t.switchProfile}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 1.5 Profile Strength Meter & 100% Completion Action */}
          <div className={`p-3 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-900/80 border-gray-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Award className={`w-3.5 h-3.5 ${isLight ? 'text-lime-600' : 'text-lime-400'}`} />
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                  {lang === 'bn' ? 'প্রোফাইল সম্পূর্ণতা:' : 'Profile Strength:'}
                </span>
                <span className={`text-[11px] font-mono font-extrabold ${isLight ? 'text-lime-700' : 'text-lime-300'}`}>
                  {calculateProfileCompletion(activeAccount).percentage}%
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${calculateProfileCompletion(activeAccount).levelBadgeColor}`}>
                {lang === 'bn' ? calculateProfileCompletion(activeAccount).levelTitleBn : calculateProfileCompletion(activeAccount).levelTitleEn}
              </span>
            </div>

            <div className={`w-full h-1.5 rounded-full overflow-hidden border ${isLight ? 'bg-slate-200 border-slate-300/60' : 'bg-gray-950 border-gray-800/80'}`}>
              <div 
                className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${calculateProfileCompletion(activeAccount).percentage}%` }}
              />
            </div>

            <button
              onClick={() => { setIsOpen(false); openProfileWizard(); }}
              className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                isLight 
                  ? 'bg-lime-50 hover:bg-lime-100 border border-lime-300 text-lime-900 shadow-xs' 
                  : 'bg-gray-950 hover:bg-gray-850 border border-lime-400/30 hover:border-lime-400 text-lime-300'
              }`}
            >
              <Sparkles className={`w-3 h-3 ${isLight ? 'text-lime-700' : 'text-lime-400'}`} />
              <span>
                {calculateProfileCompletion(activeAccount).percentage >= 100
                  ? (lang === 'bn' ? 'বায়ো ও লাইফস্টাইল মেট্রিক্স দেখুন' : 'View Bio & Lifestyle Metrics')
                  : (lang === 'bn' ? 'প্রোফাইল ১০০% সম্পন্ন করুন' : 'Complete 100% Profile')}
              </span>
            </button>
          </div>

          {/* 2. Controls: Language, Currency, Theme, Pro Plan */}
          <div className="space-y-3 text-xs">

            {/* Language Toggle */}
            <div className="flex items-center justify-between">
              <span className={`font-medium flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                <Languages className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-lime-300'}`} />
                <span>{t.language}</span>
              </span>
              <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-900 border-gray-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    lang === 'bn' 
                      ? (isLight ? 'bg-lime-100 text-lime-900 border border-lime-300 font-extrabold shadow-xs' : 'bg-lime-400/20 text-lime-300 border border-lime-400/30') 
                      : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white')
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    lang === 'en' 
                      ? (isLight ? 'bg-lime-100 text-lime-900 border border-lime-300 font-extrabold shadow-xs' : 'bg-lime-400/20 text-lime-300 border border-lime-400/30') 
                      : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white')
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center justify-between">
              <span className={`font-medium flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                <Coins className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                <span>{t.currency}</span>
              </span>
              <div className={`flex items-center gap-0.5 p-0.5 rounded-lg font-mono border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-900 border-gray-800'
              }`}>
                {(['৳', '$', '€', '£'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                      currency === c 
                        ? (isLight ? 'bg-lime-500 text-slate-950 font-extrabold shadow-xs' : 'bg-lime-300 text-gray-950 font-extrabold') 
                        : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white')
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle - Segmented Switch */}
            <div className="flex items-center justify-between">
              <span className={`font-medium flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span>{t.appearance}</span>
              </span>
              <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-900 border-gray-800'
              }`}>
                <button
                  type="button"
                  onClick={() => { if (theme !== 'light') toggleTheme(); }}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                    theme === 'light'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-600" />
                  <span>{t.lightMode}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Moon className="w-3 h-3 text-cyan-400" />
                  <span>{t.darkMode}</span>
                </button>
              </div>
            </div>

            {/* SaaS Subscription Tier */}
            <div className="flex items-center justify-between pt-1">
              <span className={`font-medium flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-lime-300'}`} />
                <span>{t.saasPlan}</span>
              </span>
              <button
                type="button"
                onClick={() => { setIsOpen(false); showToast(t.proToast); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 border ${
                  isLight
                    ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                    : 'bg-gradient-to-r from-amber-500/10 to-lime-500/10 border-lime-300/40 text-lime-300 hover:border-lime-300'
                }`}
              >
                <span>{t.proTier}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 3. Clearly Labeled SETTINGS and Data Actions */}
          <div className={`pt-3 border-t space-y-1 text-xs ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
            {/* The Explicit Settings Option */}
            <button
              type="button"
              onClick={() => { setIsOpen(false); openSettingsModal(); }}
              className={`w-full py-2.5 px-3 rounded-xl font-bold flex items-center justify-between transition-all border ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 hover:text-slate-950'
                  : 'bg-gray-900/80 hover:bg-gray-850 border-gray-800 hover:border-lime-400/50 text-gray-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <SettingsIcon className={`w-4 h-4 ${isLight ? 'text-lime-700' : 'text-lime-300'}`} />
                <span>{lang === 'bn' ? 'সেটিংস (Settings)' : 'Settings & Preferences'}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} />
            </button>

            {/* Download Backup */}
            <button
              type="button"
              onClick={handleExportBackup}
              className={`w-full py-2 px-2.5 rounded-xl font-medium flex items-center gap-2 text-left transition-colors ${
                isLight
                  ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950'
                  : 'hover:bg-gray-900 text-gray-300 hover:text-white'
              }`}
            >
              <Download className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`} />
              <span>{t.downloadBackup}</span>
            </button>

            {/* Load Sample Demo Data */}
            <button
              type="button"
              onClick={() => { setIsOpen(false); loadDemoData(); }}
              className={`w-full py-2 px-2.5 rounded-xl font-medium flex items-center gap-2 text-left transition-colors ${
                isLight
                  ? 'hover:bg-lime-50 text-lime-800 hover:text-lime-950'
                  : 'hover:bg-gray-900 text-lime-300 hover:text-lime-200'
              }`}
            >
              <Database className={`w-4 h-4 ${isLight ? 'text-lime-700' : 'text-lime-300'}`} />
              <span>{lang === 'bn' ? 'নমুনা ডেমো ডাটা লোড করুন' : 'Load Demo Showcase Data'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
