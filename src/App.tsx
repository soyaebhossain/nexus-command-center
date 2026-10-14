import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { NavigationBar } from './components/common/NavigationBar';
import { DashboardModule } from './components/modules/DashboardModule';
import { TasksModule } from './components/modules/TasksModule';
import { FinanceModule } from './components/modules/FinanceModule';
import { HealthModule } from './components/modules/HealthModule';
import { PlannerModule } from './components/modules/PlannerModule';
import { CalendarModule } from './components/modules/CalendarModule';
import { LearningModule } from './components/modules/LearningModule';
import { AccountModal } from './components/common/AccountModal';
import { SettingsModal } from './components/common/SettingsModal';
import { SpotlightModal } from './components/common/SpotlightModal';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    activeModule, 
    theme, 
    toastMessage, 
    openSearchModal, 
    closeAccountModal, 
    closeSettingsModal, 
    closeSearchModal 
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearchModal, closeAccountModal, closeSettingsModal, closeSearchModal]);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'tasks':
        return <TasksModule />;
      case 'finance':
        return <FinanceModule />;
      case 'health':
        return <HealthModule />;
      case 'planner':
        return <PlannerModule />;
      case 'calendar':
        return <CalendarModule />;
      case 'learning':
        return <LearningModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d12] text-gray-100 transition-colors selection:bg-lime-400 selection:text-black">
      {/* Sticky Modular Header */}
      <Header />

      {/* Primary Life Pillar Navigation */}
      <NavigationBar />

      {/* Active Module Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {renderModule()}
      </main>

      {/* Global Modals */}
      <AccountModal />
      <SettingsModal />
      <SpotlightModal />

      {/* Global Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-950/95 border border-lime-400/40 text-lime-300 text-xs font-semibold rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Minimalist Engineered Footer */}
      <footer className="border-t border-gray-900 py-4 px-6 text-center text-xs text-gray-400 flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
          <span>NEXUS Life OS • Engineered for Peak Focus & Circadian Balance</span>
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
