import React, { useEffect } from 'react';
import { LearningModule } from '../components/modules/LearningModule';
import { useApp } from '../context/AppContext';

export const LearningPage: React.FC = () => {
  const { lang } = useApp();

  useEffect(() => {
    document.title = lang === 'bn' ? 'শিক্ষা ও ক্যারিয়ার (Learning & Skills) • NEXUS Life OS' : 'Learning & Skills • NEXUS Command Center';
  }, [lang]);

  return (
    <div className="page-container animate-in fade-in duration-300">
      <LearningModule />
    </div>
  );
};
