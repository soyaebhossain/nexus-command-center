import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, Plus } from 'lucide-react';
import { Goal } from '../../types';
import { loadLocalData, saveLocalData } from '../../utils/storage';
import { useTranslation } from '../../utils/i18n';

export const PlannerModule: React.FC = () => {
  const { lang } = useApp();
  const t = useTranslation(lang);

  const [goals, setGoals] = useState<Goal[]>(() => loadLocalData('nexus_goals_react', [
    { id: 1, title: 'Master Production React & TypeScript Framework', horizon: '1-Year', category: 'Career', progress: 85, deadline: '2026-12-31' },
    { id: 2, title: 'Achieve Emergency Fund of ৳ 200,000', horizon: '1-Year', category: 'Finance', progress: 55, deadline: '2026-11-30' },
    { id: 3, title: 'Launch Commercial SaaS Platform', horizon: '3-Year', category: 'Business', progress: 40, deadline: '2027-06-30' }
  ]));

  const [title, setTitle] = useState('');
  const [horizon, setHorizon] = useState<'1-Year' | '3-Year' | 'Strategic'>('1-Year');
  const [category, setCategory] = useState('Career');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newGoal: Goal = {
      id: Date.now(),
      title: title.trim(),
      horizon,
      category,
      progress: 10,
      deadline: '2026-12-31'
    };
    const updated = [newGoal, ...goals];
    setGoals(updated);
    saveLocalData('nexus_goals_react', updated);
    setTitle('');
  };

  const updateProgress = (id: number, delta: number) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        return { ...g, progress: Math.max(0, Math.min(100, g.progress + delta)) };
      }
      return g;
    });
    setGoals(updated);
    saveLocalData('nexus_goals_react', updated);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-7 rounded-3xl bg-gray-950 border border-gray-800 space-y-2">
        <span className="text-lime-300 text-xs font-bold font-mono uppercase tracking-wider">
          STRATEGIC VISION
        </span>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Target className="text-lime-300 w-6 h-6" />
          <span>{t.plannerTitle}</span>
        </h2>
        <p className="text-xs text-gray-400">
          {t.plannerSub}
        </p>
      </div>

      {/* Goal Form */}
      <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-3">
        <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-lime-300" />
          <span>{t.addGoal}</span>
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t.goalTitlePlaceholder}
            className="field sm:col-span-6 py-2.5"
          />
          <select
            value={horizon}
            onChange={e => setHorizon(e.target.value as any)}
            className="field sm:col-span-3 py-2.5"
          >
            <option value="1-Year">{lang === 'bn' ? '১ বছরের লক্ষ্য' : '1-Year Horizon'}</option>
            <option value="3-Year">{lang === 'bn' ? '৩ বছরের লক্ষ্য' : '3-Year Horizon'}</option>
            <option value="Strategic">{lang === 'bn' ? 'কৌশলগত ভিশন' : 'Strategic Vision'}</option>
          </select>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="field sm:col-span-2 py-2.5"
          >
            <option value="Career">{lang === 'bn' ? 'ক্যারিয়ার ও স্কিল' : 'Career & Dev'}</option>
            <option value="Finance">{lang === 'bn' ? 'অর্থ ও সম্পদ' : 'Finance & Asset'}</option>
            <option value="Health">{lang === 'bn' ? 'স্বাস্থ্য ও ফিটনেস' : 'Health & Fitness'}</option>
            <option value="Personal">{lang === 'bn' ? 'ব্যক্তিগত উন্নয়ন' : 'Personal Growth'}</option>
          </select>
          <button type="submit" className="sm:col-span-1 bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold py-2.5 rounded-xl">
            {lang === 'bn' ? 'যুক্ত' : 'Add'}
          </button>
        </form>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map(g => (
          <div key={g.id} className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-lime-400/10 text-lime-300 border border-lime-400/20">
                {g.horizon} • {g.category}
              </span>
              <span className="text-xs font-mono font-bold text-lime-300">{g.progress}%</span>
            </div>
            <h4 className="font-bold text-sm text-gray-200">{g.title}</h4>
            <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
              <div className="bg-lime-400 h-full rounded-full transition-all" style={{ width: `${g.progress}%` }} />
            </div>
            <div className="flex gap-2 pt-1 text-xs">
              <button onClick={() => updateProgress(g.id, -10)} className="flex-1 py-1 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white">-10%</button>
              <button onClick={() => updateProgress(g.id, +10)} className="flex-1 py-1 bg-gray-900 border border-gray-800 rounded-lg text-lime-300 hover:bg-gray-800 font-bold">+10%</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
