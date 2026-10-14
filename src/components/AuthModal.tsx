import React, { useState } from 'react';
import { ShieldCheck, User, UserCheck, X } from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  session: UserSession;
  onClose: () => void;
  onAuthenticate: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  session,
  onClose,
  onAuthenticate,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState<string>(session.name || 'Aarav Krishnan');
  const [email, setEmail] = useState<string>(session.email || 'coordinator@rapidrescue360.org');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>(session.role || 'Coordinator');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthenticate({
      name: name.trim() || 'Demo User',
      email: email.trim() || 'demo@rapidrescue360.org',
      role: selectedRole,
      isAuthenticated: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div>
            <span className="text-xs font-mono text-cyan-400">RAPID RESCUE 360° · DEMO AUTH & ROLE SWITCHER</span>
            <h2 className="text-lg font-bold text-white">
              {mode === 'login' ? 'Sign In to Demo Account' : 'Create Responder / Citizen Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 rounded-lg transition-colors cursor-pointer ${
              mode === 'signup' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Role Selector */}
        <div className="space-y-2">
          <span className="block text-xs font-medium text-slate-300">
            Select Active Demo Role View:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { role: 'Citizen', desc: 'Request Help', icon: User },
                { role: 'Volunteer', desc: 'Field Responder', icon: UserCheck },
                { role: 'Coordinator', desc: 'Command Admin', icon: ShieldCheck },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = selectedRole === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs font-bold block text-white">{item.role}</span>
                  <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label htmlFor="auth-name" className="block text-xs text-slate-300">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="auth-email" className="block text-xs text-slate-300">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-pass" className="block text-xs text-slate-300">
              Password (Demo)
            </label>
            <input
              id="auth-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs tracking-wide transition-all cursor-pointer"
          >
            {mode === 'login' ? `Continue as ${selectedRole}` : `Create ${selectedRole} Demo Profile`}
          </button>
        </form>
      </div>
    </div>
  );
};
