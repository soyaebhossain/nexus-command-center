import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar as CalendarIcon, Clock, Plus, Trash2, X, 
  ChevronLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { CalendarEvent } from '../../types';
import { useTranslation } from '../../utils/i18n';

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_NAMES_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];

export const CalendarModule: React.FC = () => {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent, tasks, lang } = useApp();
  const t = useTranslation(lang);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => today.toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [type, setType] = useState<CalendarEvent['type']>('meeting');
  const [note, setNote] = useState('');

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const setToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Calendar calculations
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const isCurrentMonthView = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  const monthTitle = lang === 'bn' 
    ? `${MONTH_NAMES_BN[currentMonth]} ${currentYear}`
    : `${MONTH_NAMES_EN[currentMonth]} ${currentYear}`;

  const weekdays = lang === 'bn' ? WEEKDAYS_BN : WEEKDAYS_EN;

  const handleOpenModal = (selectedDate?: string) => {
    if (selectedDate) setDate(selectedDate);
    setIsModalOpen(true);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    addCalendarEvent({
      title: title.trim(),
      date,
      time,
      type,
      note: note.trim() || undefined
    });
    setTitle('');
    setNote('');
    setIsModalOpen(false);
  };

  const getEventBadgeColor = (evType: CalendarEvent['type']) => {
    switch (evType) {
      case 'exam':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'bill':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'meeting':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'family':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'task':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  // Combine calendar events + tasks with due dates
  const combinedEvents: CalendarEvent[] = [
    ...calendarEvents,
    ...tasks.filter(t => t.dueDate && !calendarEvents.some(e => e.title === t.text)).map(t => ({
      id: t.id,
      title: t.text,
      date: t.dueDate,
      time: t.dueTime,
      type: 'task' as const
    }))
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="panel p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-cyan-400 text-xs font-bold font-mono tracking-wider mb-1">
            ● UNIFIED TIME & APPOINTMENT ENGINE
          </div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-gray-100">
            <CalendarIcon className="text-cyan-400 w-6 h-6" />
            <span>{lang === 'bn' ? 'একীভূত জীবন ক্যালেন্ডার ও শিডিউল প্ল্যানার' : 'Unified Life Calendar & Event Planner'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {lang === 'bn' 
              ? 'টাস্ক, পরীক্ষা, ইউটিলিটি বিল, মিটিং ও পারিবারিক সময়সূচি একনজরে একীভূত মাসিক ক্যালেন্ডারে দেখুন।' 
              : 'All tasks, exams, bills, meetings, and family milestones in one synchronized monthly view.'}
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-cyan-400 hover:bg-cyan-300 text-gray-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? '+ ইভেন্ট / রিমাইন্ডার যোগ করুন' : '+ Add Event / Reminder'}</span>
        </button>
      </div>

      {/* 2. Interactive Calendar Month Navigation & Grid */}
      <div className="panel p-6 space-y-4 shadow-xl">
        {/* Navigation Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-extrabold text-gray-100 tracking-tight">{monthTitle}</h3>
            <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-semibold">
              <button
                onClick={prevMonth}
                className="px-2.5 py-1 rounded hover:bg-gray-800 text-gray-300 flex items-center gap-1 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'পূর্ববর্তী' : 'Prev'}</span>
              </button>
              <button
                onClick={setToday}
                className="px-2.5 py-1 rounded hover:bg-gray-800 text-lime-300 font-bold transition-colors"
              >
                {lang === 'bn' ? 'আজ' : 'Today'}
              </button>
              <button
                onClick={nextMonth}
                className="px-2.5 py-1 rounded hover:bg-gray-800 text-gray-300 flex items-center gap-1 transition-colors"
                title="Next Month"
              >
                <span>{lang === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Color Category Legends */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> {lang === 'bn' ? 'টাস্ক' : 'Task'}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> {lang === 'bn' ? 'পরীক্ষা' : 'Exam'}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> {lang === 'bn' ? 'বিল' : 'Bill'}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> {lang === 'bn' ? 'মিটিং' : 'Meeting'}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> {lang === 'bn' ? 'পারিবারিক' : 'Family'}</span>
          </div>
        </div>

        {/* 7-Day Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 py-2 border-b border-gray-800">
          {weekdays.map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* 7-Column Calendar Month Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Leading blank days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[90px] p-2 rounded-xl bg-gray-950/20 border border-gray-900/40 opacity-25 pointer-events-none" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = isCurrentMonthView && today.getDate() === dayNum;

            const dayEvents = combinedEvents.filter(ev => ev.date === dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => handleOpenModal(dateStr)}
                className={`min-h-[92px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer group hover:border-cyan-400/60 ${
                  isToday 
                    ? 'bg-cyan-950/20 border-cyan-400/80 shadow-md shadow-cyan-400/10' 
                    : 'bg-gray-900/80 border-gray-800 hover:bg-gray-850'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold font-mono ${isToday ? 'text-cyan-300 font-extrabold' : 'text-gray-300'}`}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-mono font-bold bg-cyan-400 text-gray-950 px-1 rounded">
                      TODAY
                    </span>
                  )}
                </div>

                {/* Day events pills */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate border ${getEventBadgeColor(ev.type)}`}
                      title={`${ev.time ? ev.time + ' ' : ''}${ev.title}`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[9px] text-gray-400 font-mono">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Upcoming Schedule & Agenda List */}
      <div className="panel p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-100">
            <Clock className="text-cyan-400 w-4 h-4" />
            <span>{lang === 'bn' ? 'আসন্ন সময়সূচি ও ইভেন্ট এজেন্ডা' : 'Scheduled Events & Deadlines Agenda'}</span>
          </h3>
          <span className="text-xs font-mono text-gray-400">
            {combinedEvents.length} {lang === 'bn' ? 'টি ইভেন্ট' : 'scheduled'}
          </span>
        </div>

        {combinedEvents.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-8">
            {lang === 'bn' ? 'কোনো ক্যালেন্ডার ইভেন্ট নির্ধারিত নেই।' : 'No calendar events scheduled.'}
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
            {combinedEvents.sort((a, b) => a.date.localeCompare(b.date)).map(ev => (
              <div
                key={ev.id}
                className="flex justify-between items-center p-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all"
              >
                <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                  <CalendarIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-gray-200 truncate">{ev.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border ${getEventBadgeColor(ev.type)}`}>
                    {ev.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-cyan-300 font-bold">{ev.time || ''}</span>
                  <span className="font-mono text-gray-400">{ev.date}</span>
                  {calendarEvents.some(e => e.id === ev.id) && (
                    <button
                      onClick={() => deleteCalendarEvent(ev.id)}
                      className="text-gray-500 hover:text-rose-400 p-1"
                      title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Add Event Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="panel w-full max-w-md p-6 space-y-4 shadow-2xl bg-gray-950 border border-gray-800 rounded-3xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-cyan-300">
                <CalendarIcon className="w-4 h-4" />
                <span>{lang === 'bn' ? 'নতুন ক্যালেন্ডার ইভেন্ট যুক্ত করুন' : 'Add Unified Event / Reminder'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-medium">{lang === 'bn' ? 'ইভেন্ট / রিমাইন্ডারের শিরোনাম' : 'Event / Reminder Title'}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Physics Exam / Utility Bill Due"
                  className="field text-xs py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">{lang === 'bn' ? 'তারিখ' : 'Date'}</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="field text-xs py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">{lang === 'bn' ? 'সময়' : 'Time'}</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="field text-xs py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-medium">{lang === 'bn' ? 'ইভেন্টের ধরণ' : 'Event Type'}</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as CalendarEvent['type'])}
                  className="field text-xs py-2"
                >
                  <option value="meeting">🟡 {lang === 'bn' ? 'মিটিং / অ্যাপয়েন্টমেন্ট' : 'Meeting / Appointment'}</option>
                  <option value="exam">🟣 {lang === 'bn' ? 'পরীক্ষা / অ্যাকাডেমিক' : 'Exam / Academic Deadline'}</option>
                  <option value="bill">🔴 {lang === 'bn' ? 'ইউটিলিটি বিল / দেনা' : 'Utility Bill / Payment Due'}</option>
                  <option value="family">🟢 {lang === 'bn' ? 'পারিবারিক মাইলফলক' : 'Family Milestone'}</option>
                  <option value="task">🔵 {lang === 'bn' ? 'গুরুত্বপূর্ণ টাস্ক' : 'Priority Task'}</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-medium">{lang === 'bn' ? 'অতিরিক্ত নোট (ঐচ্ছিক)' : 'Optional Note'}</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Bring scientific calculator & ID card"
                  className="field text-xs py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-gray-950 font-bold py-2.5 rounded-xl transition-all shadow-md"
              >
                {lang === 'bn' ? 'ক্যালেন্ডারে সংরক্ষণ করুন' : 'Save to Calendar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
