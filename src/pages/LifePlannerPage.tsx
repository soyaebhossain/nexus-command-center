import React, { useEffect } from 'react';
import { PlannerModule } from '../components/modules/PlannerModule';
import { useApp } from '../context/AppContext';

export const LifePlannerPage: React.FC = () => {
  const { lang } = useApp();

  useEffect(() => {
    document.title = lang === 'bn' ? 'জীবন পরিকল্পনা (Life Planner) • NEXUS Life OS' : 'Life Planner • NEXUS Command Center';
  }, [lang]);

  return (
    <div className="page-container animate-in fade-in duration-300">
      <PlannerModule />
    </div>
  );
};
