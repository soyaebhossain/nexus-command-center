import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, Sparkles, CheckSquare, Copy, Check, Send, 
  Trash2, RefreshCw, AlertCircle, Clock, ShieldCheck, 
  FileText, ExternalLink, ArrowRight, Zap, Flame
} from 'lucide-react';
import { playChime, playCelebrationArpeggio } from '../../utils/audio';

type EmailIntent = 'executive' | 'concise' | 'decline' | 'clarification' | 'urgent';

interface TriageResult {
  priority: 'P1' | 'P2' | 'P3';
  priorityTitleEn: string;
  priorityTitleBn: string;
  prioColor: string;
  summary: string;
  actionItem: string;
  reply: string;
}

const PRESET_SAMPLES = [
  {
    nameEn: '🚨 Critical Bug / Downtime (P1)',
    nameBn: '🚨 জরুরি সার্ভার সমস্যা / P1',
    intent: 'urgent' as EmailIntent,
    text: `Subject: CRITICAL: Production Database Timeout & 500 Errors
From: client-ops@enterprise.com
URGENT! Our checkout and customer dashboard have been throwing 500 error codes since 2 PM. Clients are complaining and our revenue is impacted. Please investigate immediately and deploy a hotfix ASAP!`
  },
  {
    nameEn: '💼 Project Scope & Budget Approval (P2)',
    nameBn: '💼 প্রজেক্ট বাজেট ও সময়সীমা অনুমোদন (P2)',
    intent: 'executive' as EmailIntent,
    text: `Subject: Q4 Enterprise Architecture & Infrastructure Upgrade Proposal
From: tanvir@innovatetech.bd
Hi team, we reviewed your proposal for the cloud migration to Kubernetes. The proposed milestone timeline looks solid. Please confirm executive approval on the cost estimate and delivery schedule so we can sign off on the contract.`
  },
  {
    nameEn: '📅 Weekly Strategy Sync (P3)',
    nameBn: '📅 সাপ্তাহিক মিটিং ও সমন্বয় (P3)',
    intent: 'concise' as EmailIntent,
    text: `Subject: Sprint Retrospective & Architecture Review
From: dev-lead@alameenit.com
Hello, Please review the updated system roadmap ahead of our sprint sync tomorrow at 11 AM. Let us know if you need any adjustments or want to discuss any blockers.`
  }
];

export const EmailTriageModule: React.FC = () => {
  const { 
    lang, activeAccount, tasks, addTask, 
    ruleOf3, transactions, currency, mealReminders, 
    waterMl, habitStreak, showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'triage' | 'digest'>('triage');

  // Triage state
  const [emailText, setEmailText] = useState('');
  const [intent, setIntent] = useState<EmailIntent>('executive');
  const [result, setResult] = useState<TriageResult | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);

  // Daily digest state
  const [digestText, setDigestText] = useState('');
  const [copiedDigest, setCopiedDigest] = useState(false);

  // Analyze function
  const handleAnalyze = () => {
    if (!emailText.trim()) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে প্রথমে একটি ইমেইল বার্তা লিখুন বা পেস্ট করুন' : 'Please paste an incoming email first');
      return;
    }

    const text = emailText.trim();
    let priority: 'P1' | 'P2' | 'P3' = 'P3';
    let priorityTitleEn = 'Normal Routine (P3)';
    let priorityTitleBn = 'স্বাভাবিক অগ্রাধিকার (P3)';
    let prioColor = 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20';

    if (/urgent|emergency|asap|critical|immediate|down|crash|breach|500 error|timeout|outage|blocker/i.test(text)) {
      priority = 'P1';
      priorityTitleEn = 'Urgent & Critical (P1)';
      priorityTitleBn = 'জরুরি ও সংকটময় (P1)';
      prioColor = 'border-rose-500/50 text-rose-400 bg-rose-950/30';
    } else if (/review|deadline|contract|approval|important|budget|proposal|quote|payment|invoice|schedule/i.test(text)) {
      priority = 'P2';
      priorityTitleEn = 'High Priority (P2)';
      priorityTitleBn = 'উচ্চ অগ্রাধিকার (P2)';
      prioColor = 'border-amber-500/50 text-amber-400 bg-amber-950/30';
    }

    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const firstLine = lines[0] || 'Incoming communication';
    const cleanSubject = firstLine.replace(/^subject:\s*/i, '').trim();
    const summary = cleanSubject.length > 70 ? cleanSubject.slice(0, 70) + '...' : cleanSubject;
    const actionItem = `[Email Action] Follow up on: ${summary}`;

    // Craft tailored reply based on intent and language
    let reply = '';
    const senderGreeting = 'Hello,';
    const signOff = `Best regards,\n${activeAccount.name}\n${activeAccount.role.toUpperCase()} Lead | NEXUS Ops`;

    if (lang === 'bn') {
      switch (intent) {
        case 'executive':
          reply = `প্রিয় মহোদয়,\n\nআপনার ইমেইল ও প্রস্তাবটি আমরা বিস্তারিত পর্যালোচনা করেছি। আমাদের টিম প্রস্তাবিত কর্মপরিকল্পনা অনুমোদন করছে। নির্ধারিত সময়সূচী অনুযায়ী পরবর্তী ধাপগুলো সম্পন্ন করুন।\n\nধন্যবাদান্তে,\n${activeAccount.name}\n${activeAccount.role.toUpperCase()} | Al-Ameen IT`;
          break;
        case 'concise':
          reply = `ইমেইলটি পেয়েছি। কর্মপরিকল্পনা অনুযায়ী কাজ চলমান রয়েছে। কাজ সম্পন্ন হওয়ামাত্র আপডেট জানানো হবে।\n\nধন্যবাদ,\n${activeAccount.name}`;
          break;
        case 'decline':
          reply = `যোগাযোগের জন্য ধন্যবাদ। বর্তমান ত্রৈমাসিকে আমাদের টিম অন্যান্য জরুরি প্রকল্পে প্রতিশ্রুতিবদ্ধ থাকায় এই মুহূর্তে অতিরিক্ত কাজের দায়িত্ব নেওয়া সম্ভব হচ্ছে না। আশা করি পরবর্তীতে একসাথে কাজ করার সুযোগ হবে।\n\nশ্রদ্ধান্তে,\n${activeAccount.name}`;
          break;
        case 'clarification':
          reply = `ইমেইলের জন্য ধন্যবাদ। বিষয়টি নিখুঁতভাবে সমাধানের জন্য কিছু অতিরিক্ত তথ্য ও স্পষ্ট বিবরণী প্রয়োজন। অনুগ্রহ করে টেকনিক্যাল স্পেসিফিকেশন ও বিস্তারিত ফাইলটি পুনরায় শেয়ার করবেন কি?\n\nশুভকামনা সহ,\n${activeAccount.name}`;
          break;
        case 'urgent':
          reply = `জরুরি নোটিশটির জন্য ধন্যবাদ। আমাদের অন-কল ইঞ্জিনিয়ারিং টিম বিষয়টি সর্বোচ্চ অগ্রাধিকার দিয়ে তদন্ত শুরু করেছে। আগামী ১ ঘণ্টার মধ্যে প্রয়োজনীয় আপডেট ও সমাধান নিয়ে আসছি।\n\nতদন্তকারী দল,\n${activeAccount.name}`;
          break;
      }
    } else {
      switch (intent) {
        case 'executive':
          reply = `${senderGreeting}\n\nThank you for the update. I have thoroughly reviewed the submitted details and documentation. We formally approve proceeding with the proposed milestones subject to staging quality validation.\n\n${signOff}`;
          break;
        case 'concise':
          reply = `${senderGreeting}\n\nReceived and noted. Our team is actively executing against the agreed timeline. I will send a full confirmation as soon as verification completes.\n\n${signOff}`;
          break;
        case 'decline':
          reply = `${senderGreeting}\n\nThank you for reaching out with this opportunity. Due to our current sprint capacity and strategic commitments for this cycle, we are unable to take on additional scope at this time.\n\n${signOff}`;
          break;
        case 'clarification':
          reply = `${senderGreeting}\n\nThank you for your message. To ensure we execute this accurately and without delay, could you please clarify the target deliverables and provide the updated specifications?\n\n${signOff}`;
          break;
        case 'urgent':
          reply = `${senderGreeting}\n\nThank you for immediately alerting us. We have flagged this as an incident and our engineering team is actively investigating the root cause. We will provide a status dispatch within the hour.\n\n${signOff}`;
          break;
      }
    }

    setResult({
      priority,
      priorityTitleEn,
      priorityTitleBn,
      prioColor,
      summary,
      actionItem,
      reply
    });
    setTaskAdded(false);
    playChime();
    showToast(lang === 'bn' ? 'ইমেইল সফলভাবে বিশ্লেষণ ও ড্রাফট তৈরি হয়েছে' : 'Email triaged & executive reply drafted');
  };

  // Convert to task
  const handleConvertToTask = () => {
    if (!result) return;
    const prio = result.priority === 'P1' ? 'high' : result.priority === 'P2' ? 'medium' : 'low';
    addTask(result.actionItem, prio);
    setTaskAdded(true);
    playCelebrationArpeggio();
    showToast(lang === 'bn' ? 'অ্যাকশন আইটেমটি টাস্ক তালিকায় যুক্ত করা হয়েছে!' : 'Converted email action item into priority task!');
  };

  // Copy reply to clipboard
  const handleCopyReply = () => {
    if (!result?.reply) return;
    navigator.clipboard.writeText(result.reply);
    setCopiedDraft(true);
    showToast(lang === 'bn' ? 'ড্রাফট ক্লিপবোর্ডে কপি হয়েছে' : 'Draft copied to clipboard');
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  // Generate Daily Digest Email
  const generateDailyDigest = () => {
    const today = new Date().toISOString().split('T')[0];
    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && t.date === today)
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingTasks = tasks.filter(t => !t.done);
    const completedTasks = tasks.filter(t => t.done);

    let digest = '';
    if (lang === 'bn') {
      digest = `বিষয়: [দৈনিক সারসংক্ষেপ] - ${today} | ${activeAccount.name} (${activeAccount.role.toUpperCase()})

প্রিয় টিম / ডায়েরি,

আজকের (${today}) সার্বিক কাজের সারসংক্ষেপ ও অগ্রগতি রিপোর্ট নিচে দেওয়া হলো:

1. ৩টি প্রধান দৈনিক অগ্রাধিকার (Rule of 3):
${ruleOf3.map(r => ` - [${r.done ? '✓' : ' '}] ${r.text}`).join('\n')}

2. কাজের অগ্রগতি ও টাস্ক স্ট্যাটাস:
 - সম্পন্ন টাস্ক: ${completedTasks.length} টি
 - পেন্ডিং টাস্ক: ${pendingTasks.length} টি
${pendingTasks.slice(0, 5).map(t => `   • (${t.priority.toUpperCase()}) ${t.text}`).join('\n')}

3. আর্থিক হিসাব (আজকের দিন):
 - আজকের মোট ব্যয়: ${currency} ${totalExpenses.toLocaleString()}

4. স্বাস্থ্য ও ধারাবাহিকতা ট্র্যাকিং:
 - হাইড্রেশন (পানি গ্রহণ): ${waterMl} ml / ২৫০০ ml
 - দৈনিক হ্যাবিট স্ট্রিক: ${habitStreak} দিন সফল
 - সময়মতো আহার সম্পন্ন: ${mealReminders.filter(m => m.done).length} / ${mealReminders.length}

---
নেক্সাস লাইফ ওএস (NEXUS Life OS) দ্বারা স্বয়ংক্রিয়ভাবে সংকলিত।`;
    } else {
      digest = `Subject: [Daily Executive Briefing] - ${today} | ${activeAccount.name} (${activeAccount.role.toUpperCase()})

Hi Team / Self,

Here is the consolidated daily execution summary and operations briefing for ${today}:

1. RULE OF 3 - ABSOLUTE PRIORITIES:
${ruleOf3.map(r => ` - [${r.done ? 'DONE' : 'PENDING'}] ${r.text}`).join('\n')}

2. TASKS COCKPIT STATUS:
 - Conquered Tasks Today: ${completedTasks.length}
 - Outstanding Work Items: ${pendingTasks.length}
${pendingTasks.slice(0, 5).map(t => `   • [${t.priority.toUpperCase()}] ${t.text}`).join('\n')}

3. FINANCIAL DISPATCH (TODAY):
 - Today's Outflow: ${currency} ${totalExpenses.toLocaleString()}

4. CADENCE & VITALITY:
 - Daily Hydration: ${waterMl} ml / 2,500 ml target
 - Consecutive Habit Streak: ${habitStreak} Days
 - Circadian Meal Checks: ${mealReminders.filter(m => m.done).length} of ${mealReminders.length} logged

---
Automatically compiled by NEXUS Life OS. Client-side privacy guaranteed.`;
    }

    setDigestText(digest);
  };

  useEffect(() => {
    generateDailyDigest();
  }, [lang, ruleOf3, tasks, transactions, waterMl, habitStreak, mealReminders]);

  const handleCopyDigest = () => {
    navigator.clipboard.writeText(digestText);
    setCopiedDigest(true);
    showToast(lang === 'bn' ? 'দৈনিক সারসংক্ষেপ কপি হয়েছে!' : 'Daily digest copied to clipboard!');
    setTimeout(() => setCopiedDigest(false), 2500);
  };

  const handleOpenMailClient = (bodyText: string, subjectLine?: string) => {
    const subject = encodeURIComponent(subjectLine || `Follow-up: ${result?.summary || 'Project Update'}`);
    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner */}
      <div className="panel p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-lime-300 text-xs font-mono font-bold tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>COMMUNICATION & OPS COCKPIT</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-lime-300" />
              <span>{lang === 'bn' ? 'ডেইলি ইমেইল ও ট্রায়াজ সেন্টার' : 'Email Triage & Daily Action Center'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {lang === 'bn'
                ? 'ইনকামিং ক্লায়েন্ট ইমেইল বিশ্লেষণ করুন, অগ্রাধিকার নির্ধারণ করুন, দ্রুত এক্সিকিউটিভ রিপ্লাই প্রস্তুত করুন এবং সরাসরি টাস্কে কনভার্ট করুন।'
                : 'Analyze incoming threads, classify priority (P1/P2/P3), draft executive replies, and convert action items into priority tasks.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1.5 bg-gray-900 border border-gray-800 text-lime-300 rounded-xl flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
              <span>Offline Privacy Guaranteed</span>
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-gray-800/80 pt-2">
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'triage'
                ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ইনকামিং ইমেইল ট্রায়াজ ও ড্রাফটার' : 'Incoming Thread Triage'}</span>
          </button>

          <button
            onClick={() => setActiveTab('digest')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'digest'
                ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ডেইলি এক্সিকিউটিভ ডাইজেস্ট ইমেইল' : 'Daily Executive Digest'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Incoming Triage */}
      {activeTab === 'triage' && (
        <div className="space-y-6">
          {/* Input & Controls Panel */}
          <div className="panel p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono uppercase font-bold text-gray-300 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-lime-300" />
                <span>{lang === 'bn' ? 'ইনকামিং ইমেইল বা মেসেজ থ্রেড পেস্ট করুন' : 'Paste Incoming Email or Message Thread'}</span>
              </label>

              {/* Preset Sample Quick-Pick */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-gray-500 text-[11px] font-medium mr-1">
                  {lang === 'bn' ? 'স্যাম্পল লোড:' : 'Quick Demo:'}
                </span>
                {PRESET_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setEmailText(sample.text);
                      setIntent(sample.intent);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-lime-300 text-[11px] transition-colors"
                  >
                    {lang === 'bn' ? sample.nameBn : sample.nameEn}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={emailText}
              onChange={e => setEmailText(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'ক্লায়েন্ট বা টিমের ইনকামিং ইমেইল বা রিকোয়েস্ট এখানে পেস্ট করুন...'
                  : 'Paste incoming email thread, support ticket, or client inquiry here...'
              }
              className="w-full min-h-[140px] p-4 rounded-2xl bg-[#090b0f] border border-gray-800 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 leading-relaxed font-mono"
            />

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">{lang === 'bn' ? 'রেসপন্স ইনটেন্ট:' : 'Intent:'}</span>
                  <select
                    value={intent}
                    onChange={e => setIntent(e.target.value as EmailIntent)}
                    className="bg-[#090b0f] border border-gray-800 text-xs text-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:border-lime-400"
                  >
                    <option value="executive">
                      {lang === 'bn' ? 'এক্সিকিউটিভ অনুমোদন (Executive Approval)' : 'Executive Approval & Sign-off'}
                    </option>
                    <option value="concise">
                      {lang === 'bn' ? 'সংক্ষিপ্ত স্বীকৃতি (Concise Acknowledgment)' : 'Concise Acknowledgment & Sync'}
                    </option>
                    <option value="decline">
                      {lang === 'bn' ? 'বিনীত অসম্মতি / সময় প্রার্থনা (Polite Postponement)' : 'Polite Postponement / Decline'}
                    </option>
                    <option value="clarification">
                      {lang === 'bn' ? 'তথ্য ও ব্যাখ্যা চাওয়া (Request Clarification)' : 'Request Clarification & Specs'}
                    </option>
                    <option value="urgent">
                      {lang === 'bn' ? 'জরুরি তদন্ত ও সমাধান আশ্বাস (Urgent Escalation)' : 'Urgent Incident Escalation'}
                    </option>
                  </select>
                </div>

                <button
                  onClick={handleAnalyze}
                  className="bg-lime-400 hover:bg-lime-300 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gray-950" />
                  <span>{lang === 'bn' ? 'বিশ্লেষণ ও ড্রাফট তৈরি করুন' : 'Analyze Thread & Draft Reply'}</span>
                </button>
              </div>

              {emailText && (
                <button
                  onClick={() => {
                    setEmailText('');
                    setResult(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-rose-400 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Analysis & Output Grid */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
              {/* Column 1: Extracted Action Signal */}
              <div className="panel p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-lime-300">
                      EXTRACTED ACTION SIGNAL
                    </span>
                    <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${result.prioColor}`}>
                      {lang === 'bn' ? result.priorityTitleBn : result.priorityTitleEn}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-2">
                    <div className="text-xs text-gray-400 font-mono">
                      {lang === 'bn' ? 'শনাক্তকৃত মূল বিষয়:' : 'Identified Core Topic:'}
                    </div>
                    <div className="text-sm font-semibold text-gray-100 leading-snug">
                      "{result.summary}"
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800/50 space-y-1">
                    <div className="text-[11px] text-gray-400">
                      {lang === 'bn'
                        ? 'সুপারিশকৃত পদক্ষেপ: পর্যালোচনা করে সিদ্ধান্ত নিশ্চিত করুন অথবা অ্যাকশন আইটেমটি আপনার টাস্ক তালিকায় যুক্ত করুন।'
                        : 'Recommended action: Review details and convert to high-priority task in your active cockpit.'}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleConvertToTask}
                    disabled={taskAdded}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      taskAdded
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                        : 'bg-lime-400 hover:bg-lime-300 text-gray-950 shadow-md active:scale-95'
                    }`}
                  >
                    {taskAdded ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'bn' ? 'টাস্কে যুক্ত করা হয়েছে ✓' : 'Added to Priority Tasks ✓'}</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'টাস্ক তালিকায় কনভার্ট করুন' : 'Convert to Priority Task'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Column 2: Auto-Crafted Reply */}
              <div className="panel p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-lime-300">
                      AUTO-CRAFTED EXECUTIVE REPLY
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {lang === 'bn' ? 'সম্পাদনাযোগ্য' : 'Editable'}
                    </span>
                  </div>

                  <textarea
                    value={result.reply}
                    onChange={e => setResult({ ...result, reply: e.target.value })}
                    className="w-full h-44 p-3.5 rounded-xl bg-[#090b0f] border border-gray-800 text-xs text-gray-200 focus:outline-none focus:border-lime-400/50 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyReply}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-200 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedDraft ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-lime-400" />
                        <span className="text-lime-300">{lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'ক্লিপবোর্ডে কপি' : 'Copy Draft'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenMailClient(result.reply, `Re: ${result.summary}`)}
                    className="px-3.5 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title={lang === 'bn' ? 'ইমেইল ক্লায়েন্টে খুলুন' : 'Open in Default Email Client'}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-lime-400" />
                    <span>{lang === 'bn' ? 'মেইল খুলুন' : 'Open Mail'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Daily Digest Email */}
      {activeTab === 'digest' && (
        <div className="panel p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-lime-300" />
                <span>{lang === 'bn' ? 'দৈনিক এক্সিকিউটিভ প্রগ্রেস ডাইজেস্ট' : 'Consolidated Daily Operations Digest'}</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {lang === 'bn'
                  ? 'আপনার আজকের ৩টি প্রধান লক্ষ্য, আর্থিক প্রবাহ, টাস্ক ও স্বাস্থ্য সম্পর্কিত পূর্ণাঙ্গ রিপোর্ট স্বয়ংক্রিয়ভাবে জেনারেট করা হয়েছে।'
                  : 'Automatically aggregates Rule of 3 priorities, tasks cockpit status, daily spend, and vitality streak.'}
              </p>
            </div>

            <button
              onClick={generateDailyDigest}
              className="px-3 py-1.5 rounded-xl border border-gray-800 hover:bg-gray-900 text-xs text-gray-300 hover:text-lime-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'তথ্য রিফ্রেশ করুন' : 'Refresh Live Data'}</span>
            </button>
          </div>

          <textarea
            value={digestText}
            onChange={e => setDigestText(e.target.value)}
            className="w-full min-h-[300px] p-4 rounded-2xl bg-[#090b0f] border border-gray-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-lime-400/50 leading-relaxed font-mono"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800/80">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyDigest}
                className="bg-lime-400 hover:bg-lime-300 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                {copiedDigest ? (
                  <>
                    <Check className="w-4 h-4 text-gray-950" />
                    <span>{lang === 'bn' ? 'ডাইজেস্ট কপি হয়েছে!' : 'Digest Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-950" />
                    <span>{lang === 'bn' ? 'ডাইজেস্ট ক্লিপবোর্ডে কপি করুন' : 'Copy Digest to Clipboard'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleOpenMailClient(digestText, `Daily Executive Briefing - ${new Date().toISOString().split('T')[0]}`)}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-lime-400" />
                <span>{lang === 'bn' ? 'ইমেইল পাঠিয়ে দিন' : 'Send via Email App'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
