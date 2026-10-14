import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sliders, Languages, Coins } from 'lucide-react';
import { CurrencySymbol, LanguageCode } from '../../types';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsModalOpen, closeSettingsModal, currency, setCurrency, 
    lang, setLang, activeAccount 
  } = useApp();

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Sliders className="text-lime-300 w-5 h-5" />
            <span>Workspace Preferences & Settings</span>
          </h3>
          <button onClick={closeSettingsModal} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-gray-400 block mb-1.5 font-medium flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-lime-300" />
              <span>System Language (সিস্টেম ভাষা)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`py-2.5 rounded-xl font-bold border transition-all ${
                  lang === 'bn' ? 'bg-lime-400/20 text-lime-300 border-lime-400/40' : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                বাংলা (Bengali)
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`py-2.5 rounded-xl font-bold border transition-all ${
                  lang === 'en' ? 'bg-lime-400/20 text-lime-300 border-lime-400/40' : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                English (International)
              </button>
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-1.5 font-medium flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Active Currency Symbol (সক্রিয় মুদ্রা)</span>
            </label>
            <div className="grid grid-cols-4 gap-2 font-mono">
              {(['৳', '$', '€', '£'] as CurrencySymbol[]).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                    currency === c ? 'bg-lime-300 text-gray-950 border-lime-300' : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
            <h4 className="font-bold text-gray-200">Production React 19 + TypeScript Engine</h4>
            <p className="text-[11px] text-gray-400">
              Clean modular components, Express REST API synchronization, and 100% offline fallback.
            </p>
          </div>
        </div>

        <button
          onClick={closeSettingsModal}
          className="w-full py-2.5 bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold rounded-xl text-xs"
        >
          Close Preferences
        </button>
      </div>
    </div>
  );
};
