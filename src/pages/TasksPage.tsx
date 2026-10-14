import React, { useEffect } from 'react';
import { TasksModule } from '../components/modules/TasksModule';
import { useApp } from '../context/AppContext';

export const TasksPage: React.FC = () => {
  const { lang } = useApp();

  useEffect(() => {
    document.title = lang === 'bn' ? 'কাজ ও ফোকাস (Tasks & Focus) • NEXUS Life OS' : 'Tasks & Focus • NEXUS Command Center';
  }, [lang]);

  return (
    <div className="page-container animate-in fade-in duration-300">
      <TasksModule />
    </div>
  );
};
