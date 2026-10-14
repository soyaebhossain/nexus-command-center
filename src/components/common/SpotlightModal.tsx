import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search } from 'lucide-react';
import { ModuleId } from '../../types';

export const SpotlightModal: React.FC = () => {
  const { 
    isSearchModalOpen, closeSearchModal, tasks, transactions, 
    setActiveModule, lang 
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isSearchModalOpen) return null;

  const q = query.toLowerCase().trim();

  const MODULE_SHORTCUTS: { id: ModuleId; nameEn: string; nameBn: string; keywords: string }[] = [
    { id: 'dashboard', nameEn: 'Daily Flow', nameBn: 'দৈনিক প্রবাহ', keywords: 'dashboard home overview flow দৈনিক' },
    { id: 'tasks', nameEn: 'Tasks & Focus', nameBn: 'কাজ ও ফোকাস', keywords: 'tasks focus todo কাজ ফোকাস' },
    { id: 'triage', nameEn: 'Daily Email', nameBn: 'ডেইলি ইমেইল', keywords: 'email triage mail inbox draft ডেইলি ইমেইল ট্রায়াজ' },
    { id: 'finance', nameEn: 'Finance & Budget', nameBn: 'অর্থ ও বাজেট', keywords: 'finance budget money expense ledger অর্থ বাজেট টাকা খরচ' },
    { id: 'health', nameEn: 'Health & Meals', nameBn: 'স্বাস্থ্য ও আহার', keywords: 'health meal food water nutrition স্বাস্থ্য খাবার পানি' },
    { id: 'planner', nameEn: 'Life Planner', nameBn: 'জীবন পরিকল্পনা', keywords: 'planner vision okr goals পরিকল্পনা' },
    { id: 'calendar', nameEn: 'Calendar', nameBn: 'ক্যালেন্ডার', keywords: 'calendar schedule events agenda ক্যালেন্ডার' },
    { id: 'learning', nameEn: 'Learning & Skills', nameBn: 'শিক্ষা ও ক্যারিয়ার', keywords: 'learning courses skills reading শিক্ষা ক্যারিয়ার' }
  ];

  const matchedModules = q 
    ? MODULE_SHORTCUTS.filter(m => 
        m.nameEn.toLowerCase().includes(q) || 
        m.nameBn.toLowerCase().includes(q) || 
        m.keywords.toLowerCase().includes(q)
      ) 
    : [];

  const matchedTasks = q ? tasks.filter(t => t.text.toLowerCase().includes(q)) : [];
  const matchedTrans = q ? transactions.filter(t => t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) : [];

  const handleNavigate = (mod: ModuleId) => {
    setActiveModule(mod);
    closeSearchModal();
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-3xl p-4 space-y-4 max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
          <Search className="w-5 h-5 text-lime-300 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'টাস্ক, লেনদেন বা মডিউল খুঁজতে লিখুন... (বন্ধ করতে ESC)' : 'Type to search across tasks, finance, and modules... (ESC to close)'}
            className="flex-1 bg-transparent border-0 text-sm text-gray-100 focus:outline-none"
          />
          <button onClick={closeSearchModal} className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded border border-gray-800">
            ESC
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
          {!q ? (
            <div className="text-gray-500 text-center py-8">
              {lang === 'bn' 
                ? 'টাস্ক, আর্থিক লেনদেন খুঁজতে লিখুন অথবা সরাসরি যেকোনো মডিউলে যান...' 
                : 'Quick search tasks, financial transactions, or jump directly to modules...'}
            </div>
          ) : (
            <>
              {matchedModules.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-sky-400 font-bold px-2">
                    {lang === 'bn' ? 'মডিউল জাম্প' : 'Jump to Module'}
                  </div>
                  {matchedModules.map(m => (
                    <div
                      key={m.id}
                      onClick={() => handleNavigate(m.id)}
                      className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-sky-400/50 cursor-pointer flex justify-between items-center transition-all"
                    >
                      <span className="text-gray-100 font-semibold">{lang === 'bn' ? m.nameBn : m.nameEn}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60">Module</span>
                    </div>
                  ))}
                </div>
              )}

              {matchedTasks.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-lime-300 font-bold px-2">
                    {lang === 'bn' ? 'খুঁজে পাওয়া টাস্ক' : 'Matched Tasks'}
                  </div>

                  {matchedTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleNavigate('tasks')}
                      className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-lime-300/40 cursor-pointer flex justify-between items-center"
                    >
                      <span className="text-gray-200 font-medium">{t.text}</span>
                      <span className="text-[10px] uppercase font-mono text-gray-400">{t.priority}</span>
                    </div>
                  ))}
                </div>
              )}

              {matchedTrans.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold px-2">
                    {lang === 'bn' ? 'খুঁজে পাওয়া লেনদেন' : 'Matched Transactions'}
                  </div>
                  {matchedTrans.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleNavigate('finance')}
                      className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-emerald-400/40 cursor-pointer flex justify-between items-center"
                    >
                      <span className="text-gray-200 font-medium">{t.desc} ({t.category})</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{t.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              {matchedTasks.length === 0 && matchedTrans.length === 0 && matchedModules.length === 0 && (
                <div className="text-gray-500 text-center py-6">
                  {lang === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি।' : 'No matching records found.'}
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
};
