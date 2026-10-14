import React, { useEffect } from 'react';
import { EmailTriageModule } from '../components/modules/EmailTriageModule';
import { useApp } from '../context/AppContext';

export const DailyEmailPage: React.FC = () => {
  const { lang } = useApp();

  useEffect(() => {
    document.title = lang === 'bn' ? 'ডেইলি ইমেইল (Daily Email Triage) • NEXUS Life OS' : 'Daily Email Triage • NEXUS Command Center';
  }, [lang]);

  return (
    <div className="page-container animate-in fade-in duration-300">
      <EmailTriageModule />
    </div>
  );
};
