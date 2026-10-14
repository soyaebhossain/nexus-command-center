import React, { useEffect } from 'react';
import { FinanceModule } from '../components/modules/FinanceModule';
import { useApp } from '../context/AppContext';

export const FinancePage: React.FC = () => {
  const { lang } = useApp();

  useEffect(() => {
    document.title = lang === 'bn' ? 'অর্থ ও বাজেট (Finance & Budget) • NEXUS Life OS' : 'Finance & Budget • NEXUS Command Center';
  }, [lang]);

  return (
    <div className="page-container animate-in fade-in duration-300">
      <FinanceModule />
    </div>
  );
};
