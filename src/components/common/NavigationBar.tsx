import React from 'react';
import { useApp } from '../../context/AppContext';
import { ModuleId } from '../../types';
import { 
  Sun, CheckSquare, Wallet, Activity, Target, 
  Calendar, GraduationCap, Mail 
} from 'lucide-react';
import { ROUTE_CONFIGS, getRoutePath } from '../../utils/routes';

interface NavItem {
  id: ModuleId;
  labelEn: string;
  labelBn: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelEn: 'Daily Flow', labelBn: 'দৈনিক প্রবাহ', icon: <Sun className="w-3.5 h-3.5" /> },
  { id: 'tasks', labelEn: 'Tasks & Focus', labelBn: 'কাজ ও ফোকাস', icon: <CheckSquare className="w-3.5 h-3.5" /> },
  { id: 'triage', labelEn: 'Daily Email', labelBn: 'ডেইলি ইমেইল', icon: <Mail className="w-3.5 h-3.5" /> },
  { id: 'finance', labelEn: 'Finance & Budget', labelBn: 'অর্থ ও বাজেট', icon: <Wallet className="w-3.5 h-3.5" /> },
  { id: 'health', labelEn: 'Health & Meals', labelBn: 'স্বাস্থ্য ও আহার', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'planner', labelEn: 'Life Planner', labelBn: 'জীবন পরিকল্পনা', icon: <Target className="w-3.5 h-3.5" /> },
  { id: 'calendar', labelEn: 'Calendar', labelBn: 'ক্যালেন্ডার', icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: 'learning', labelEn: 'Learning & Skills', labelBn: 'শিক্ষা ও ক্যারিয়ার', icon: <GraduationCap className="w-3.5 h-3.5" /> }
];

export const NavigationBar: React.FC = () => {
  const { activeModule, setActiveModule, enabledModules, isFocusMode, lang } = useApp();

  const enabledList = NAV_ITEMS.filter(item => enabledModules.includes(item.id));

  const items = isFocusMode 
    ? enabledList.filter(item => ['dashboard', 'tasks', 'finance', 'health'].includes(item.id))
    : enabledList;

  return (
    <nav className="px-4 sm:px-8 py-1 bg-[#090b0f]/80">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {items.map(item => {
          const isActive = activeModule === item.id;
          const routePath = getRoutePath(item.id);

          return (
            <a
              key={item.id}
              href={routePath}
              onClick={(e) => {
                e.preventDefault();
                setActiveModule(item.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 select-none ${
                isActive
                  ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
              }`}
            >
              {item.icon}
              <span>{lang === 'bn' ? item.labelBn : item.labelEn}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

