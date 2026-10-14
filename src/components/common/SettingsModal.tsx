import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Settings as SettingsIcon, Languages, Coins, Sliders, 
  Download, Upload, Sparkles, AlertTriangle, CheckSquare, 
  Sun, CheckSquare as CheckIcon 
} from 'lucide-react';
import { CurrencySymbol, ModuleId } from '../../types';
import { downloadJSON } from '../../utils/storage';
import { useTranslation } from '../../utils/i18n';

const ALL_MODULES_CONFIG: { id: ModuleId; nameEn: string; nameBn: string }[] = [
  { id: 'dashboard', nameEn: 'Daily Flow', nameBn: 'দৈনিক প্রবাহ' },
  { id: 'tasks', nameEn: 'Tasks & Focus', nameBn: 'কাজ ও ফোকাস' },
  { id: 'triage', nameEn: 'Daily Email & Triage', nameBn: 'ডেইলি ইমেইল ও ট্রায়াজ' },
  { id: 'finance', nameEn: 'Finance & Budget', nameBn: 'অর্থ ও বাজেট' },
  { id: 'health', nameEn: 'Health & Meals', nameBn: 'স্বাস্থ্য ও আহার' },
  { id: 'planner', nameEn: 'Life Planner', nameBn: 'জীবন পরিকল্পনা' },
  { id: 'calendar', nameEn: 'Calendar & Agenda', nameBn: 'ক্যালেন্ডার ও এজেন্ডা' },
  { id: 'learning', nameEn: 'Learning & Skills', nameBn: 'শিক্ষা ও ক্যারিয়ার' }
];


export const SettingsModal: React.FC = () => {
  const { 
    isSettingsModalOpen, closeSettingsModal, currency, setCurrency, 
    lang, setLang, activeAccount, updateAccountName,
    enabledModules, toggleModuleEnabled, enableAllModules,
    tasks, transactions, ruleOf3, mealReminders, calendarEvents,
    loadDemoData, factoryReset, showToast 
  } = useApp();

  const t = useTranslation(lang);
  const [profileName, setProfileName] = useState(activeAccount.name);

  if (!isSettingsModalOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccountName(profileName);
  };

  const handleExportBackup = () => {
    const data = {
      app: 'NEXUS Life OS',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      account: activeAccount,
      tasks,
      transactions,
      ruleOf3,
      mealReminders,
      calendarEvents,
      enabledModules
    };
    downloadJSON(`nexus_full_backup_${new Date().toISOString().split('T')[0]}.json`, data);
    showToast(t.backupToast);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tasks || parsed.transactions) {
          localStorage.setItem(`nexus_${activeAccount.id}_tasks`, JSON.stringify(parsed.tasks || []));
          localStorage.setItem(`nexus_${activeAccount.id}_transactions`, JSON.stringify(parsed.transactions || []));
          showToast(lang === 'bn' ? 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!' : 'Backup successfully restored!');
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <SettingsIcon className="text-lime-300 w-5 h-5" />
            <span>{lang === 'bn' ? 'ওয়ার্কস্পেস সেটিংস ও কাস্টমাইজেশন' : 'Workspace Settings & Customizer'}</span>
          </h3>
          <button onClick={closeSettingsModal} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Executive Profile */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            {lang === 'bn' ? 'প্রোফাইল সেটিংস' : 'Executive Profile'}
          </h4>
          <form onSubmit={handleSaveName} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-8">
              <label className="text-gray-400 block mb-1 font-medium">{lang === 'bn' ? 'আপনার নাম' : 'Your Name'}</label>
              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                className="field text-xs py-2"
                placeholder="e.g. Md. Soyaeb Hossain"
              />
            </div>
            <div className="sm:col-span-4 flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-gray-900 hover:bg-gray-850 border border-gray-700 text-lime-300 font-bold rounded-xl transition-all"
              >
                {lang === 'bn' ? 'নাম পরিবর্তন' : 'Update Name'}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Language */}
            <div>
              <label className="text-gray-400 block mb-1 font-medium flex items-center gap-1.5 text-xs">
                <Languages className="w-3.5 h-3.5 text-lime-300" />
                <span>{t.language}</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`py-2 rounded-xl font-bold border transition-all text-xs ${
                    lang === 'bn' ? 'bg-lime-400/20 text-lime-300 border-lime-400/40' : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`py-2 rounded-xl font-bold border transition-all text-xs ${
                    lang === 'en' ? 'bg-lime-400/20 text-lime-300 border-lime-400/40' : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="text-gray-400 block mb-1 font-medium flex items-center gap-1.5 text-xs">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.currency}</span>
              </label>
              <div className="grid grid-cols-4 gap-1 font-mono text-xs">
                {(['৳', '$', '€', '£'] as CurrencySymbol[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      currency === c ? 'bg-lime-300 text-gray-950 border-lime-300' : 'bg-gray-900 border-gray-800 text-gray-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Modular Workspace Customizer (Enable/Disable Modules) */}
        <div className="space-y-3 border-t border-gray-800 pt-4 text-xs">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs uppercase font-bold text-lime-300 tracking-wider">
                {lang === 'bn' ? 'মডিউল কাস্টমাইজেশন (সক্রিয়/নিষ্ক্রিয়)' : 'Module Customizer (Enable/Disable)'}
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {lang === 'bn' ? 'আপনার প্রয়োজনীয় মডিউলগুলো চালু বা বন্ধ রাখুন।' : 'Keep only the life pillars you are currently focusing on.'}
              </p>
            </div>
            <button
              type="button"
              onClick={enableAllModules}
              className="text-[11px] text-lime-300 hover:underline font-bold"
            >
              {lang === 'bn' ? 'সব মডিউল চালু' : 'Enable All'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_MODULES_CONFIG.map(m => {
              const isEnabled = enabledModules.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleModuleEnabled(m.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isEnabled
                      ? 'bg-gray-900 border-lime-400/40 text-gray-200'
                      : 'bg-gray-950/60 border-gray-800/80 text-gray-500 line-through'
                  }`}
                >
                  <span className="font-semibold">{lang === 'bn' ? m.nameBn : m.nameEn}</span>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    readOnly
                    className="accent-lime-300 pointer-events-none"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Data Snapshot & Backup */}
        <div className="space-y-3 border-t border-gray-800 pt-4 text-xs">
          <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            {lang === 'bn' ? 'ডাটা ব্যাকআপ ও রিস্টোর' : 'Data Snapshot & Backup (Offline-First)'}
          </h4>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-lime-300 rounded-xl text-xs font-semibold flex items-center gap-2 text-gray-200"
            >
              <Download className="w-4 h-4 text-lime-300" />
              <span>{lang === 'bn' ? 'সম্পূর্ণ JSON ব্যাকআপ ডাউনলোড' : 'Export Full JSON Snapshot'}</span>
            </button>

            <label className="px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-cyan-400 rounded-xl text-xs font-semibold flex items-center gap-2 text-gray-200 cursor-pointer">
              <Upload className="w-4 h-4 text-cyan-300" />
              <span>{lang === 'bn' ? 'ব্যাকআপ থেকে রিস্টোর' : 'Restore from JSON Backup'}</span>
              <input type="file" onChange={handleImportFile} className="hidden" accept=".json" />
            </label>

            <button
              type="button"
              onClick={loadDemoData}
              className="px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-amber-400 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'শোকেস ডেমো ডাটা লোড' : 'Load Demo Showcase Data'}</span>
            </button>
          </div>
        </div>

        {/* 4. Danger Zone */}
        <div className="border-t border-gray-800 pt-4 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-2xl gap-3">
            <div>
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{lang === 'bn' ? 'ওয়ার্কস্পেস ডাটা রিসেট' : 'Clear Workspace Data'}</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {lang === 'bn' ? 'সব লোকাল ডাটা স্থায়ীভাবে মুছে যাবে।' : 'Dual confirmation required. Irreversible.'}
              </div>
            </div>
            <button
              type="button"
              onClick={factoryReset}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all"
            >
              {lang === 'bn' ? 'ফ্যাক্টরি রিসেট' : 'Factory Reset'}
            </button>
          </div>
        </div>

        {/* Footer Close */}
        <button
          onClick={closeSettingsModal}
          className="w-full py-2.5 bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold rounded-xl text-xs"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
