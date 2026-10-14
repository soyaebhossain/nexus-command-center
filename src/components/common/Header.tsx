import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, Search, Clock } from 'lucide-react';
import { AccountDropdown } from './AccountDropdown';
import { useTranslation } from '../../utils/i18n';

export const Header: React.FC = () => {
  const { lang, openSearchModal, theme } = useApp();
  const t = useTranslation(lang);
  const [timeStr, setTimeStr] = useState('00:00');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLight = theme === 'light';

  return (
    <div className={`px-4 sm:px-8 py-2 sm:py-2.5 transition-colors ${isLight ? 'border-b border-slate-200/80 bg-white/90' : 'border-b border-gray-800/60'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">

        {/* Left Side: Brand Logo + Minimal Inner Clock */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-md transition-all ${
            isLight 
              ? 'bg-lime-600 text-white shadow-lime-600/20' 
              : 'bg-lime-300 text-gray-950 shadow-lime-300/20'
          }`}>
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-base flex items-center gap-1 ${isLight ? 'text-slate-900' : 'text-gray-100'}`}>
              <span>{t.appNameEn || 'NEXUS'}</span>
              <span className={isLight ? 'text-lime-600 font-black' : 'text-lime-300'}>.</span>
              <span className={`text-xs uppercase font-mono tracking-wider ${isLight ? 'text-slate-500 font-semibold' : 'text-gray-400'}`}>{t.appSub}</span>
            </span>
          </div>

          {/* Minimal Clock on the Inner Side */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold tabular-nums shadow-inner ml-1 border transition-colors ${
            isLight 
              ? 'bg-slate-100/90 border-slate-200 text-slate-800' 
              : 'bg-gray-900/90 border-gray-800 text-gray-300'
          }`}>
            <Clock className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-lime-600' : 'text-lime-400'}`} />
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Center Spotlight Search Bar */}
        <div className="flex-1 max-w-md mx-1 sm:mx-2">
          <div
            onClick={openSearchModal}
            className={`w-full px-3.5 py-1.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors shadow-inner border ${
              isLight
                ? 'bg-slate-100/80 hover:bg-slate-200/60 border-slate-200 hover:border-slate-300 text-slate-600'
                : 'bg-gray-900/80 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Search className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-lime-600' : 'text-lime-300'}`} />
              <span className="truncate">{t.searchPlaceholder}</span>
            </span>
            <kbd className={`hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded border font-mono ${
              isLight 
                ? 'bg-slate-200 border-slate-300 text-slate-600' 
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}>
              {t.ctrlK}
            </kbd>
          </div>
        </div>

        {/* Far Right: ONLY 👤 Icon (Everything else consolidated inside) */}
        <div className="shrink-0 flex items-center">
          <AccountDropdown />
        </div>
      </div>
    </div>
  );
};

