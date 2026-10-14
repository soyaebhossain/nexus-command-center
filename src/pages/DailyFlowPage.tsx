import React, { useEffect } from 'react';
import { DashboardModule } from '../components/modules/DashboardModule';
import { useApp } from '../context/AppContext';

export const DailyFlowPage: React.FC = () => {
  const { lang } = useApp();

  useEffect(() => {
    document.title = lang === 'bn' ? 'দৈনিক প্রবাহ (Daily Flow) • NEXUS Life OS' : 'Daily Flow • NEXUS Command Center';
  }, [lang]);

  return (
    <div className="page-container animate-in fade-in duration-300">
      <DashboardModule />
    </div>
  );
};
