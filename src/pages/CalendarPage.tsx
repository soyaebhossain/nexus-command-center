import React, { useEffect } from 'react';
import { CalendarModule } from '../components/modules/CalendarModule';
import { useApp } from '../context/AppContext';

export const CalendarPage: React.FC = () => {
  const { lang } = useApp();

  useEffect(() => {
    document.title = lang === 'bn' ? 'ক্যালেন্ডার ও ইভেন্টস (Calendar) • NEXUS Life OS' : 'Calendar & Schedule • NEXUS Command Center';
  }, [lang]);

  return (
    <div className="page-container animate-in fade-in duration-300">
      <CalendarModule />
    </div>
  );
};
