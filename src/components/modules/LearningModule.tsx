import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Plus } from 'lucide-react';
import { Course } from '../../types';
import { loadLocalData, saveLocalData } from '../../utils/storage';
import { useTranslation } from '../../utils/i18n';

export const LearningModule: React.FC = () => {
  const { lang, showToast } = useApp();
  const t = useTranslation(lang);

  const [courses, setCourses] = useState<Course[]>(() => loadLocalData('nexus_courses_react', [
    { id: 1, name: 'Advanced React 19 & TypeScript Masterclass', platform: 'Udemy', totalHours: 40, hoursCompleted: 28, completed: false },
    { id: 2, name: 'System Design & Distributed Architecture', platform: 'Coursera', totalHours: 35, hoursCompleted: 15, completed: false },
    { id: 3, name: 'Node.js & Express REST API Production Engineering', platform: 'FrontendMasters', totalHours: 25, hoursCompleted: 22, completed: false }
  ]));

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [totalHours, setTotalHours] = useState('20');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newCourse: Course = {
      id: Date.now(),
      name: name.trim(),
      platform: platform.trim() || 'Online',
      totalHours: parseInt(totalHours) || 20,
      hoursCompleted: 0,
      completed: false
    };
    const updated = [newCourse, ...courses];
    setCourses(updated);
    saveLocalData('nexus_courses_react', updated);
    setName('');
    setPlatform('');
    showToast(lang === 'bn' ? `কোর্স যোগ হয়েছে: "${newCourse.name}"` : `Added course: "${newCourse.name}"`);
  };

  const logHours = (id: number, hrs: number) => {
    const updated = courses.map(c => {
      if (c.id === id) {
        const next = Math.min(c.totalHours, c.hoursCompleted + hrs);
        return { ...c, hoursCompleted: next, completed: next >= c.totalHours };
      }
      return c;
    });
    setCourses(updated);
    saveLocalData('nexus_courses_react', updated);
    showToast(lang === 'bn' ? `+${hrs} ঘণ্টা পড়ার সময় যোগ হয়েছে!` : `+${hrs} Study hours logged!`);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-7 rounded-3xl bg-gray-950 border border-gray-800 space-y-2">
        <span className="text-purple-400 text-xs font-bold font-mono uppercase tracking-wider">
          SKILL & EDUCATION
        </span>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <GraduationCap className="text-purple-400 w-6 h-6" />
          <span>{t.learningTitle}</span>
        </h2>
        <p className="text-xs text-gray-400">
          {t.learningSub}
        </p>
      </div>

      {/* Add Course */}
      <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-3">
        <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-400" />
          <span>{t.addCourse}</span>
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={lang === 'bn' ? "কোর্সের নাম লিখুন (যেমন: 'অ্যাডভান্সড এআই ইঞ্জিনিয়ারিং')..." : "Course name (e.g. 'Advanced AI Engineering')..."}
            className="field sm:col-span-6 py-2.5"
          />
          <input
            type="text"
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            placeholder={lang === 'bn' ? "প্ল্যাটফর্ম (যেমন: Coursera / YouTube / বই)..." : "Platform (e.g. Coursera / YouTube / Book)..."}
            className="field sm:col-span-3 py-2.5"
          />
          <input
            type="number"
            value={totalHours}
            onChange={e => setTotalHours(e.target.value)}
            placeholder={lang === 'bn' ? "মোট ঘণ্টা..." : "Total Hours..."}
            className="field sm:col-span-2 py-2.5 font-mono"
          />
          <button type="submit" className="sm:col-span-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl">
            {lang === 'bn' ? 'যুক্ত' : 'Add'}
          </button>
        </form>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map(c => {
          const pct = Math.round((c.hoursCompleted / c.totalHours) * 100);
          return (
            <div key={c.id} className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-400/10 text-purple-300 border border-purple-400/20">
                  {c.platform}
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">{pct}%</span>
              </div>
              <h4 className="font-bold text-sm text-gray-200">{c.name}</h4>
              <div className="text-xs font-mono text-gray-400">
                {c.hoursCompleted} / {c.totalHours} {lang === 'bn' ? 'ঘণ্টা সম্পন্ন' : 'Hours Logged'}
              </div>
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex gap-2 pt-1 text-xs">
                <button onClick={() => logHours(c.id, 1)} className="flex-1 py-1.5 bg-gray-900 border border-gray-800 hover:border-purple-400/40 rounded-lg text-purple-300 font-bold">
                  {lang === 'bn' ? '+১ ঘণ্টা' : '+1h Study'}
                </button>
                <button onClick={() => logHours(c.id, 2)} className="flex-1 py-1.5 bg-gray-900 border border-gray-800 hover:border-purple-400/40 rounded-lg text-purple-300 font-bold">
                  {lang === 'bn' ? '+২ ঘণ্টা' : '+2h Study'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
