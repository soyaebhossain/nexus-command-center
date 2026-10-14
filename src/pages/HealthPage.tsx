import React, { useEffect } from 'react';
import { HealthModule } from '../components/modules/HealthModule';
import { useApp } from '../context/AppContext';

export const HealthPage: React.FC = () => {
  const { lang } = useApp();

  useEffect(() => {
    document.title = lang === 'bn' ? 'স্বাস্থ্য ও আহার (Health & Meals) • NEXUS Life OS' : 'Health & Meals • NEXUS Command Center';
  }, [lang]);

  return (
    <div className="page-container animate-in fade-in duration-300">
      <HealthModule />
    </div>
  );
};
