import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, Plus, Clock, Trash2, CheckCircle2, Circle, 
  Play, Pause, RotateCcw 
} from 'lucide-react';
import { playChime } from '../../utils/audio';
import { useTranslation } from '../../utils/i18n';

export const TasksModule: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, lang } = useApp();
  const t = useTranslation(lang);

  const [text, setText] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueTime, setDueTime] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  // Pomodoro State
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pomoRunning && pomoSeconds > 0) {
      interval = setInterval(() => setPomoSeconds(s => s - 1), 1000);
    } else if (pomoSeconds === 0) {
      playChime(1200);
      setPomoRunning(false);
      setPomoSeconds(25 * 60);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [pomoRunning, pomoSeconds]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTask(text.trim(), priority, dueTime || undefined);
    setText('');
    setDueTime('');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.done;
    if (filter === 'done') return task.done;
    return true;
  });

  const pomoMin = Math.floor(pomoSeconds / 60);
  const pomoSec = pomoSeconds % 60;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Pomodoro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-gray-950 border border-gray-800 space-y-2">
          <span className="text-lime-300 text-xs font-bold font-mono uppercase tracking-wider">
            PRIORITY & FOCUS
          </span>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <CheckSquare className="text-lime-300 w-6 h-6" />
            <span>{t.tasksTitle}</span>
          </h2>
          <p className="text-xs text-gray-400">
            {t.tasksSub}
          </p>
        </div>

        {/* Pomodoro Focus Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950/20 via-gray-950 to-gray-950 border border-amber-500/20 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold font-mono uppercase text-amber-300">{t.pomodoroTimer}</span>
            <span className="text-[10px] text-gray-500">{lang === 'bn' ? '২৫ মিনিট স্প্রিন্ট' : '25 Min Sprint'}</span>
          </div>

          <div className="text-3xl font-bold font-mono text-center text-amber-200">
            {String(pomoMin).padStart(2, '0')}:{String(pomoSec).padStart(2, '0')}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPomoRunning(!pomoRunning)}
              className="flex-1 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-xs flex items-center justify-center gap-1 transition-all"
            >
              {pomoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{pomoRunning ? t.pauseFocus : t.startFocus}</span>
            </button>
            <button
              onClick={() => { setPomoRunning(false); setPomoSeconds(25 * 60); }}
              className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              title={t.resetFocus}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. TASK ENTRY FORM */}
      <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-lime-300" />
          <span>{lang === 'bn' ? 'নতুন কাজ ও সময় নির্ধারণ করুন' : 'Add Priority Task'}</span>
        </h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <input
            type="text"
            required
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={lang === 'bn' ? "কাজের বিবরণ লিখুন (যেমন: 'রিসার্চ পেপারের খসড়া তৈরি')" : "What needs to get done next? (e.g. 'Draft research paper')"}
            className="field sm:col-span-6 py-2.5"
          />

          <select
            value={priority}
            onChange={e => setPriority(e.target.value as 'high' | 'medium' | 'low')}
            className="field sm:col-span-3 py-2.5"
          >
            <option value="high">🔴 {t.priorityHigh}</option>
            <option value="medium">🟡 {t.priorityMedium}</option>
            <option value="low">🟢 {t.priorityLow}</option>
          </select>

          <input
            type="time"
            value={dueTime}
            onChange={e => setDueTime(e.target.value)}
            className="field sm:col-span-2 py-2.5 font-mono text-cyan-300"
            title={lang === 'bn' ? 'অ্যালার্টের সময়' : 'Optional Alert Time'}
          />

          <button
            type="submit"
            className="sm:col-span-1 bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold py-2.5 rounded-xl transition-all"
          >
            {t.addTaskBtn}
          </button>
        </form>
      </div>

      {/* 3. TASK LIST WITH FILTERS */}
      <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {(['all', 'active', 'done'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl transition-all ${
                  filter === f
                    ? 'bg-lime-400/20 text-lime-300 border border-lime-400/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? t.filterAll : f === 'active' ? t.filterPending : t.filterCompleted}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-gray-400">
            {filteredTasks.length} {lang === 'bn' ? 'টি কাজ' : 'items'}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            {t.noTasks}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl bg-gray-900 border transition-all flex items-center justify-between gap-3 ${
                  task.done ? 'border-gray-800/60 opacity-60' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="text-gray-400 hover:text-lime-300 shrink-0"
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-lime-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <span className={`text-xs font-medium text-gray-200 truncate ${task.done ? 'line-through text-gray-500' : ''}`}>
                    {task.text}
                  </span>

                  {task.dueTime && (
                    <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-gray-950 px-2 py-0.5 rounded border border-gray-800 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{task.dueTime}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    task.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-500 hover:text-rose-400 p-1"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
