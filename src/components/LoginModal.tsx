import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  ArrowRight,
  Users,
} from 'lucide-react';
import { UserSession } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [email, setEmail] = useState(currentSession.email || 'maximo@construq.com');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('');
  const [selectedPresetUser, setSelectedPresetUser] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickUsers = [
    {
      name: 'Máximo Benítez',
      email: 'maximo@construq.com',
      role: 'Socio Mayoritario (50%)',
    },
    {
      name: 'Sergio Navarro',
      email: 'sergio@construq.com',
      role: 'Socio Director (25%)',
    },
    {
      name: 'Mario Rossi',
      email: 'mario@construq.com',
      role: 'Socio Director (25%)',
    },
    {
      name: 'Ing. Lucas Valenzuela',
      email: 'gerencia@construq.com',
      role: 'Gerente General (20% Honorario)',
    },
  ];

  const handleSelectPreset = (u: (typeof quickUsers)[0]) => {
    setSelectedPresetUser(u);
    setEmail(u.email);
    setPassword('Construq2026!Sec');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMsg(null);
    setStep('mfa');
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length < 4) {
      setErrorMsg('Por favor ingrese el código de 6 dígitos de su aplicación autenticadora.');
      return;
    }

    const targetUser = selectedPresetUser || quickUsers.find((u) => u.email === email) || {
      name: 'Máximo Benítez',
      email,
      role: 'Socio Mayoritario (50%)',
    };

    const targetRole: UserSession['role'] =
      targetUser.role?.includes('Gerente') ? 'Gerente General' : 'Socio Director';

    const newSession: UserSession = {
      isAuthenticated: true,
      name: targetUser.name,
      email: targetUser.email,
      role: targetRole,
      mfaVerified: true,
      mfaEnabled: true,
      mfaMethod: 'app_totp',
      lastLogin: new Date().toISOString(),
      encryptionActive: true,
    };

    onLoginSuccess(newSession);
    setStep('credentials');
    setMfaCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ingreso Seguro a la Plataforma</h3>
              <p className="text-[11px] text-slate-400">Autenticación Multifactor & Cifrado</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5 text-xs">
            {/* Quick Profile Selectors */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Iniciar Como (Acceso Rápido de Prueba):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickUsers.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => handleSelectPreset(u)}
                    className={`p-2 rounded-xl text-left border transition ${
                      email === u.email
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{u.role}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Correo Electrónico Corporativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Contraseña</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continuar a Verificación 2FA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <Smartphone className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="font-bold text-white text-sm">Verificación en Dos Pasos (2FA)</div>
              <p className="text-[11px] text-slate-400">
                Abra su aplicación autenticadora e ingrese el código de 6 dígitos generado para <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 text-center">
                Código de Autenticación de 6 Dígitos
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="482 910"
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl py-3 text-center text-xl font-mono font-black text-amber-400 tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-500 text-center mt-1">
                * Para demostración puede ingresar cualquier código de 6 dígitos (ej: 123456)
              </p>
            </div>

            {errorMsg && (
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
              >
                Validar y Acceder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
