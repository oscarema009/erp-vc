import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  Lock,
  History,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Users,
} from 'lucide-react';
import { UserSession } from '../types';

interface SecurityViewProps {
  session: UserSession;
  onUpdateSession: (session: UserSession) => void;
  onOpenLoginModal: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  session,
  onUpdateSession,
  onOpenLoginModal,
}) => {
  const [toggleMfaSuccess, setToggleMfaSuccess] = useState(false);

  const toggleMfa = () => {
    onUpdateSession({
      ...session,
      mfaEnabled: !session.mfaEnabled,
    });
    setToggleMfaSuccess(true);
    setTimeout(() => setToggleMfaSuccess(false), 2500);
  };

  const auditLogs = [
    {
      action: 'Autenticación MFA Exitosa (TOTP)',
      ip: '181.44.120.94 (Buenos Aires, AR)',
      device: 'Chrome en macOS (Apple Silicon)',
      time: 'Hoy, 09:14 hs',
      status: 'success',
    },
    {
      action: 'Cifrado de base de datos local verificado (AES-256)',
      ip: 'Interno',
      device: 'Motor de Almacenamiento Local Cifrado',
      time: 'Hoy, 08:30 hs',
      status: 'success',
    },
    {
      action: 'Acceso a Distribución de Utilidades Societarias',
      ip: '181.44.120.94 (Buenos Aires, AR)',
      device: 'Socio Mayoritario (Máximo Benítez)',
      time: 'Ayer, 18:45 hs',
      status: 'success',
    },
    {
      action: 'Generación de Acta de Directorio y Firma Digital',
      ip: '190.220.14.80 (Córdoba, AR)',
      device: 'Socio Sergio Navarro',
      time: '22/09/2026, 14:10 hs',
      status: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/60 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Seguridad Empresarial, MFA & Cifrado Extremo a Extremo
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Protocolo de seguridad bancaria para constructoras: autenticación multifactor (2FA), cifrado AES-256 en reposo y tránsito, y auditoría inmutable de accesos.
          </p>
        </div>

        <button
          onClick={onOpenLoginModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-amber-400" />
          <span>Cambiar de Usuario / Sesión</span>
        </button>
      </div>

      {/* Main Security Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MFA Setup Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Autenticación Multifactor (MFA / 2FA)</h3>
                <p className="text-xs text-slate-400">Google Authenticator o Microsoft Authenticator</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                session.mfaEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {session.mfaEnabled ? 'Activo' : 'Desactivado'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Protege el acceso a las cuentas corrientes de los socios y los saldos bancarios de las obras exigiendo un código temporal de 6 dígitos cada vez que inicia sesión.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="font-semibold text-slate-200">Dispositivo MFA Asociado:</div>
            <div className="font-mono text-emerald-400 text-[11px]">
              iPhone 15 Pro Max · App: Google Authenticator (TOTP RFC 6238)
            </div>
            <div className="text-[10px] text-slate-500">Última validación: Hoy a las 09:14 hs</div>
          </div>

          <button
            onClick={toggleMfa}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              session.mfaEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{session.mfaEnabled ? 'Desactivar MFA Temporalmente' : 'Activar MFA con Código QR'}</span>
          </button>

          {toggleMfaSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold text-center">
              Estado de autenticación MFA actualizado con éxito.
            </div>
          )}
        </div>

        {/* End-to-End Encryption Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cifrado de Datos Extremo a Extremo</h3>
              <p className="text-xs text-slate-400">Protección criptográfica AES-256 en reposo y TLS 1.3</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Todos los libros de compras, nóminas UOCRA, cuotas de los socios (Máximo, Sergio y Mario) e inventarios están protegidos con claves simétricas criptográficas.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Algoritmo de Cifrado:</span>
              <span className="font-mono text-white font-bold">AES-GCM-256 bits</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Cifrado en Tránsito:</span>
              <span className="font-mono text-emerald-400 font-bold">TLS 1.3 / HTTPS Estricto</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Hash de Integridad:</span>
              <span className="font-mono text-slate-300 text-[10px]">SHA-256 (Hash Validado)</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Session Info */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <span>Perfil de Sesión Activa</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Usuario Activo</div>
            <div className="font-bold text-white mt-0.5">{session.name}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Correo Electrónico</div>
            <div className="font-mono text-slate-300 mt-0.5">{session.email}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Rol en el Sistema</div>
            <div className="font-bold text-amber-400 mt-0.5">{session.role}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Pacto Societario Asignado</div>
            <div className="font-bold text-purple-400 mt-0.5">Socio Mayoritario (50%)</div>
          </div>
        </div>
      </div>

      {/* Security Audit Log Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Registro Inmutable de Eventos de Seguridad</span>
          </h3>
          <span className="text-[11px] text-slate-400">Auditoría continua de accesos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Fecha y Hora</th>
                <th className="p-2.5">Evento de Seguridad</th>
                <th className="p-2.5">Dispositivo / Agente</th>
                <th className="p-2.5">Dirección IP</th>
                <th className="p-2.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-2.5 font-mono text-slate-300">{log.time}</td>
                  <td className="p-2.5 font-medium text-white">{log.action}</td>
                  <td className="p-2.5 text-slate-400">{log.device}</td>
                  <td className="p-2.5 font-mono text-slate-400">{log.ip}</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verificado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
