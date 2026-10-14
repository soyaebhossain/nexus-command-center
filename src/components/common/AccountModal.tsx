import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Trash2, Check, Lock } from 'lucide-react';
import { RoleKey } from '../../types';
import { useTranslation } from '../../utils/i18n';

export const AccountModal: React.FC = () => {
  const { 
    isAccountModalOpen, closeAccountModal, accounts, 
    activeAccountId, switchAccount, createAccount, deleteAccount,
    lang 
  } = useApp();

  const t = useTranslation(lang);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [role, setRole] = useState<RoleKey>('universal');
  const [pin, setPin] = useState('');

  if (!isAccountModalOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createAccount(name.trim(), avatar, role, pin.trim() || undefined);
    setName('');
    setPin('');
    setShowCreate(false);
    closeAccountModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-start border-b border-gray-800 pb-4">
          <div>
            <span className="text-xs font-bold text-lime-300 uppercase tracking-wider">{t.modalMultiUser}</span>
            <h3 className="text-2xl font-extrabold mt-1 text-gray-100 flex items-center gap-2">
              <span>{t.modalWho}</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {t.modalProfilesSub}
            </p>
          </div>
          <button onClick={closeAccountModal} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {accounts.map(acc => {
            const isAct = acc.id === activeAccountId;
            return (
              <div
                key={acc.id}
                onClick={() => { switchAccount(acc.id); closeAccountModal(); }}
                className={`p-4 rounded-2xl bg-gray-900 border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isAct ? 'border-lime-300 bg-lime-950/20' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-3xl">{acc.avatar}</span>
                  {isAct ? (
                    <span className="text-[10px] font-bold bg-lime-400 text-gray-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{t.activeProfile}</span>
                    </span>
                  ) : accounts.length > 1 ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteAccount(acc.id); }}
                      className="text-gray-500 hover:text-rose-400 p-1"
                      title={t.deleteProfile}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-100 truncate">{acc.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-mono uppercase text-lime-300 font-semibold bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
                      {acc.role}
                    </span>
                    {acc.pin && <Lock className="w-3 h-3 text-amber-400" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Profile Section */}
        <div className="border-t border-gray-800 pt-4">
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-3 bg-gray-900 hover:bg-gray-850 border border-dashed border-gray-700 hover:border-lime-300 rounded-2xl text-xs font-bold text-lime-300 flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.createProfile}</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4 bg-gray-900/60 border border-gray-800 p-5 rounded-2xl animate-in fade-in">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">{t.createProfile}</h4>
                <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white text-xs">
                  {t.close}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'প্রোফাইলের নাম' : 'Profile Name'}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t.profileNamePlaceholder}
                    className="field text-xs py-2 w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'অবতার ইমোজি' : 'Avatar Emoji'}</label>
                  <select
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    className="field text-xs py-2 w-full"
                  >
                    <option value="👤">👤 {lang === 'bn' ? 'ডিফল্ট ইউজার' : 'Default User'}</option>
                    <option value="💼">💼 {lang === 'bn' ? 'কর্পোরেট প্রফেশনাল' : 'Corporate Professional'}</option>
                    <option value="🎓">🎓 {lang === 'bn' ? 'শিক্ষার্থী / লার্নার' : 'Student / Learner'}</option>
                    <option value="💻">💻 {lang === 'bn' ? 'টেক / ডেভেলপার' : 'Tech / Developer'}</option>
                    <option value="🚀">🚀 {lang === 'bn' ? 'উদ্যোক্তা' : 'Entrepreneur'}</option>
                    <option value="🏡">🏡 {lang === 'bn' ? 'পরিবার / গৃহস্থালি' : 'Household / Family'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 text-xs">{t.selectRole}</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as RoleKey)}
                    className="field text-xs py-2 w-full"
                  >
                    <option value="universal">⚡ {lang === 'bn' ? 'ইউনিভার্সাল এক্সিকিউটিভ' : 'Universal Executive'}</option>
                    <option value="student">🎓 {lang === 'bn' ? 'শিক্ষার্থী ও লার্নার' : 'Student & Learner'}</option>
                    <option value="professional">💼 {lang === 'bn' ? 'কর্পোরেট প্রফেশনাল' : 'Corporate Professional'}</option>
                    <option value="freelancer">💻 {lang === 'bn' ? 'ফ্রিল্যান্সার ও ক্রিয়েটর' : 'Freelancer & Creator'}</option>
                    <option value="business">🏢 {lang === 'bn' ? 'ব্যবসায়ী' : 'Business Owner'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 text-xs">{t.pinOptional}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder={lang === 'bn' ? 'পিন না রাখতে খালি রাখুন' : 'Leave blank for no PIN'}
                    className="field text-xs py-2 font-mono w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                {t.saveProfile}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
