import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, Search, Clock } from 'lucide-react';
import { AccountDropdown } from './AccountDropdown';
import { useTranslation } from '../../utils/i18n';

export const Header: React.FC = () => {
  const { lang, openSearchModal } = useApp();
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

  return (
    <header className="border-b border-gray-800/80 bg-[#0b0d12]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Side: Brand Logo + Minimal Inner Clock */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-lime-300 text-gray-950 flex items-center justify-center font-bold shadow-md shadow-lime-300/20">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-base flex items-center gap-1 text-gray-100">
              <span>{t.appNameEn || 'NEXUS'}</span>
              <span className="text-lime-300">.</span>
              <span className="text-xs uppercase font-mono tracking-wider text-gray-400">{t.appSub}</span>
            </span>
          </div>

          {/* Minimal Clock on the Inner Side */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-900/90 border border-gray-800 text-[11px] font-mono font-bold text-gray-300 tabular-nums shadow-inner ml-1">
            <Clock className="w-3.5 h-3.5 text-lime-400 shrink-0" />
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Center Spotlight Search Bar */}
        <div className="flex-1 max-w-md mx-1 sm:mx-2">
          <div
            onClick={openSearchModal}
            className="w-full bg-gray-900/80 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 px-3.5 py-1.5 rounded-xl flex items-center justify-between text-xs text-gray-400 cursor-pointer transition-colors shadow-inner"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-lime-300 shrink-0" />
              <span className="truncate">{t.searchPlaceholder}</span>
            </span>
            <kbd className="hidden sm:inline-block text-[10px] bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono text-gray-400">
              {t.ctrlK}
            </kbd>
          </div>
        </div>

        {/* Far Right: ONLY 👤 Icon (Everything else consolidated inside) */}
        <div className="shrink-0 flex items-center">
          <AccountDropdown />
        </div>
      </div>
    </header>
  );
};
