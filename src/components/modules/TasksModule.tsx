import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, Plus, Clock, Trash2, CheckCircle2, Circle, 
  Play, Pause, RotateCcw, AlertCircle 
} from 'lucide-react';
import { playChime } from '../../utils/audio';

export const TasksModule: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, lang } = useApp();

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

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
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
            PRODUCTIVITY & PRIORITY ENGINE
          </span>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <CheckSquare className="text-lime-300 w-6 h-6" />
            <span>{lang === 'bn' ? 'কাজের অগ্রাধিকার ও টাইম-ব্লকিং' : 'Tasks, Deadlines & Deep Work Focus'}</span>
          </h2>
          <p className="text-xs text-gray-400">
            {lang === 'bn' ? 'অপ্রয়োজনীয় কাজ বাদ দিয়ে P1, P2 প্রায়োরিটি নির্ধারণ করুন।' : 'Organize commitments by P1-P3 severity, set alert times, and execute in focused sprints.'}
          </p>
        </div>

        {/* Pomodoro Focus Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950/20 via-gray-950 to-gray-950 border border-amber-500/20 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold font-mono uppercase text-amber-300">Pomodoro Focus Timer</span>
            <span className="text-[10px] text-gray-500">25 Min Sprint</span>
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
              <span>{pomoRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
            <button
              onClick={() => { setPomoRunning(false); setPomoSeconds(25 * 60); }}
              className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
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
          <span>Add Priority Task (নতুন কাজ ও সময় নির্ধারণ করুন)</span>
        </h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <input
            type="text"
            required
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What needs to get done next? (যেমন: 'রিসার্চ পেপারের খসড়া তৈরি')"
            className="field sm:col-span-6 py-2.5"
          />

          <select
            value={priority}
            onChange={e => setPriority(e.target.value as 'high' | 'medium' | 'low')}
            className="field sm:col-span-3 py-2.5"
          >
            <option value="high">🔴 P1 High Priority</option>
            <option value="medium">🟡 P2 Medium</option>
            <option value="low">🟢 P3 Low Priority</option>
          </select>

          <input
            type="time"
            value={dueTime}
            onChange={e => setDueTime(e.target.value)}
            className="field sm:col-span-2 py-2.5 font-mono text-cyan-300"
            title="Optional Alert Time"
          />

          <button
            type="submit"
            className="sm:col-span-1 bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold py-2.5 rounded-xl transition-all"
          >
            Add
          </button>
        </form>
      </div>

      {/* 3. TASK LIST WITH FILTERS */}
      <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 text-xs">
            {(['all', 'active', 'done'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl font-bold uppercase text-[11px] transition-all ${
                  filter === f ? 'bg-lime-400 text-gray-950' : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                {f} ({f === 'all' ? tasks.length : f === 'active' ? tasks.filter(t => !t.done).length : tasks.filter(t => t.done).length})
              </button>
            ))}
          </div>

          <span className="text-[10px] text-gray-500 font-mono">
            {tasks.filter(t => t.done).length} / {tasks.length} Conquered
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredTasks.length === 0 ? (
            <div className="text-xs text-gray-500 py-8 text-center">No tasks match this filter.</div>
          ) : (
            filteredTasks.map(t => (
              <div
                key={t.id}
                className={`p-3.5 rounded-2xl bg-gray-900 border transition-all flex items-center justify-between text-xs ${
                  t.done ? 'border-gray-800/60 opacity-60' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(t.id)} className="text-gray-400 hover:text-lime-300">
                    {t.done ? <CheckCircle2 className="w-4 h-4 text-lime-400" /> : <Circle className="w-4 h-4" />}
                  </button>
                  <div>
                    <div className={`font-semibold text-gray-200 ${t.done ? 'line-through text-gray-500' : ''}`}>
                      {t.text}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2 mt-0.5">
                      <span className={`uppercase font-bold ${
                        t.priority === 'high' ? 'text-rose-400' : t.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {t.priority}
                      </span>
                      <span>• Due {t.dueDate}</span>
                      {t.dueTime && (
                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t.dueTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-gray-500 hover:text-rose-400 p-1"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
