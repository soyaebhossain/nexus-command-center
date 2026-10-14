import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Trash2, Check, Lock } from 'lucide-react';
import { RoleKey } from '../../types';

export const AccountModal: React.FC = () => {
  const { 
    isAccountModalOpen, closeAccountModal, accounts, 
    activeAccountId, switchAccount, createAccount, deleteAccount 
  } = useApp();

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
            <span className="text-xs font-bold text-lime-300 uppercase tracking-wider">Multi-User Space Isolation</span>
            <h3 className="text-2xl font-extrabold mt-1 text-gray-100 flex items-center gap-2">
              <span>👥 Who is using NEXUS?</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Switch between isolated profiles. Each profile keeps separate tasks, budgets, and habits.
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
                  <span className="text-3xl">{acc.avatar || '👤'}</span>
                  <div className="flex items-center gap-1.5">
                    {acc.pin && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                    {isAct && <span className="px-2 py-0.5 rounded bg-lime-300 text-gray-950 text-[10px] font-extrabold font-mono">ACTIVE</span>}
                    {accounts.length > 1 && !isAct && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAccount(acc.id); }}
                        className="text-gray-500 hover:text-rose-400 p-1"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-100 text-sm truncate">{acc.name}</h4>
                  <span className="text-[10px] text-gray-400 font-mono uppercase">{acc.role}</span>
                </div>

                <button
                  type="button"
                  className={`w-full py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isAct ? 'bg-lime-400/20 text-lime-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {isAct ? 'Current Workspace' : 'Switch Space ›'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Create Profile Section */}
        <div className="pt-4 border-t border-gray-800 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-lime-300 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Add New Profile
            </h4>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="text-xs text-gray-400 hover:text-white"
            >
              {showCreate ? '− Close' : '+ Create Profile'}
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} className="space-y-3 bg-gray-900/90 p-4 rounded-2xl border border-gray-800 text-xs animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Profile Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Soyaeb (Work) / Tanvir (Student)"
                    className="field text-xs py-2 w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Avatar Emoji</label>
                  <select
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    className="field text-xs py-2 w-full"
                  >
                    <option value="👤">👤 Default User</option>
                    <option value="💼">💼 Corporate Professional</option>
                    <option value="🎓">🎓 Student / Learner</option>
                    <option value="💻">💻 Tech / Developer</option>
                    <option value="🚀">🚀 Entrepreneur</option>
                    <option value="🏡">🏡 Household / Family</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Role Persona</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as RoleKey)}
                    className="field text-xs py-2 w-full"
                  >
                    <option value="universal">⚡ Universal Executive</option>
                    <option value="student">🎓 Student & Learner</option>
                    <option value="professional">💼 Corporate Professional</option>
                    <option value="freelancer">💻 Freelancer & Creator</option>
                    <option value="business">🏢 Business Owner</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">4-Digit Security PIN (Optional)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Leave blank for no PIN"
                    className="field text-xs py-2 font-mono w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Create Account & Switch
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
