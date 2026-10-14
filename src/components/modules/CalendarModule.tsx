import React from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';

export const CalendarModule: React.FC = () => {
  const { tasks, mealReminders, lang } = useApp();
  const t = useTranslation(lang);

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-7 rounded-3xl bg-gray-950 border border-gray-800 space-y-2">
        <span className="text-cyan-400 text-xs font-bold font-mono uppercase tracking-wider">
          UNIFIED SCHEDULE
        </span>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <CalendarIcon className="text-cyan-400 w-6 h-6" />
          <span>{t.calendarTitle}</span>
        </h2>
        <p className="text-xs text-gray-400">
          {t.calendarSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Tasks Agenda */}
        <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-lime-300" />
            <span>{lang === 'bn' ? 'আজকের সক্রিয় কাজের ডেডলাইন' : 'Active Priority Deadlines'} ({tasks.filter(task => !task.done).length})</span>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
            {tasks.filter(task => !task.done).map(task => (
              <div key={task.id} className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-200 font-medium">{task.text}</span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold">{task.dueTime || (lang === 'bn' ? 'সারাদিন' : 'All Day')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Circadian Meals Schedule */}
        <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{lang === 'bn' ? 'আজকের সার্কেডিয়ান খাবারের সময়সূচি' : 'Circadian Meal Alerts Today'}</span>
          </h3>
          <div className="space-y-2 text-xs">
            {mealReminders.map(m => (
              <div key={m.id} className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>{m.icon}</span>
                  <span className="text-gray-200 font-medium">{lang === 'bn' ? m.nameBn : m.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-lime-300">{m.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
