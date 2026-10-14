import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { NavigationBar } from './components/common/NavigationBar';
import { 
  DailyFlowPage, 
  TasksPage, 
  DailyEmailPage, 
  FinancePage, 
  HealthPage, 
  LifePlannerPage, 
  CalendarPage, 
  LearningPage 
} from './pages';
import { AccountModal } from './components/common/AccountModal';
import { SettingsModal } from './components/common/SettingsModal';
import { SpotlightModal } from './components/common/SpotlightModal';
import { ProfileWizardModal } from './components/common/ProfileWizardModal';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    activeModule, 
    theme, 
    toastMessage, 
    openSearchModal, 
    closeAccountModal, 
    closeSettingsModal, 
    closeSearchModal,
    closeProfileWizard 
  } = useApp();

  // Sync theme class to document.body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Global hotkeys (Ctrl+K / Cmd+K for search, Escape for closing modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
      } else if (e.key === 'Escape') {
        closeAccountModal();
        closeSettingsModal();
        closeSearchModal();
        closeProfileWizard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearchModal, closeAccountModal, closeSettingsModal, closeSearchModal, closeProfileWizard]);

  const renderPage = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DailyFlowPage />;
      case 'tasks':
        return <TasksPage />;
      case 'triage':
        return <DailyEmailPage />;
      case 'finance':
        return <FinancePage />;
      case 'health':
        return <HealthPage />;
      case 'planner':
        return <LifePlannerPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'learning':
        return <LearningPage />;
      default:
        return <DailyFlowPage />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors selection:bg-lime-400 selection:text-black ${
      theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0b0d12] text-gray-100'
    }`}>
      {/* Sticky Scroll-Locked Top Header & Navigation Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        theme === 'light' 
          ? 'bg-white/95 border-slate-200/90 shadow-sm shadow-slate-200/50' 
          : 'bg-[#0b0d12]/95 border-gray-800/80 shadow-md shadow-black/20'
      }`}>
        <Header />
        <NavigationBar />
      </header>

      {/* Active Dedicated Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {renderPage()}
      </main>

      {/* Global Modals */}
      <AccountModal />
      <SettingsModal />
      <SpotlightModal />
      <ProfileWizardModal />

      {/* Global Floating Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 border ${
          theme === 'light'
            ? 'bg-white/95 border-lime-500/50 text-lime-800 shadow-slate-300'
            : 'bg-gray-950/95 border-lime-400/40 text-lime-300'
        }`}>
          <Sparkles className="w-4 h-4 text-lime-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Minimalist Engineered Footer */}
      <footer className={`border-t py-4 px-6 text-center text-xs flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full transition-colors ${
        theme === 'light' ? 'border-slate-200 text-slate-500 bg-white' : 'border-gray-900 text-gray-400 bg-transparent'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
          <span>
            {useApp().lang === 'bn' 
              ? 'নেক্সাস লাইফ ওএস • সর্বোচ্চ ফোকাস ও সার্কেডিয়ান ভারসাম্যের জন্য নির্মিত' 
              : 'NEXUS Life OS • Engineered for Peak Focus & Circadian Balance'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <span>React + TypeScript + Node.js</span>
          <span>•</span>
          <span>REST API Active</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
