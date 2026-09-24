import React from 'react';
import {
  Building2,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  BrainCircuit,
  Lock,
  Menu,
  Sparkles,
} from 'lucide-react';
import { Obra, UserSession } from '../types';

export interface NavbarProps {
  obras: Obra[];
  selectedObraId: string;
  onSelectObra: (id: string) => void;
  session: UserSession;
  onOpenFastEntry?: () => void;
  onOpenExcelImport?: () => void;
  onOpenExcelModal?: () => void;
  onOpenMfaModal?: () => void;
  onOpenLoginModal?: () => void;
  onToggleSidebarMobile?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenAiAudit?: () => void;
  onSelectTab?: (tab: any) => void;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  obras,
  selectedObraId,
  onSelectObra,
  onOpenFastEntry,
  onOpenExcelImport,
  onOpenExcelModal,
  onOpenMfaModal,
  onOpenLoginModal,
  session,
  onToggleSidebarMobile,
  onToggleMobileMenu,
  onOpenAiAudit,
  onSelectTab,
  isSyncing = false,
}) => {
  const handleToggleMenu = onToggleSidebarMobile || onToggleMobileMenu || (() => {});
  const handleExcelModal = onOpenExcelModal || onOpenExcelImport || (() => {});
  const handleSecurityModal = onOpenLoginModal || onOpenMfaModal || (() => {});
  const handleFastEntry = onOpenFastEntry || (() => onSelectTab && onSelectTab('fast_entry'));
  const handleAiAudit = onOpenAiAudit || (() => onSelectTab && onSelectTab('ai_assistant'));
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMenu}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">
                    CONSTRUQ
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Fintech ERP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Gestión Empresarial, Obras & Socios
                </p>
              </div>
            </div>
          </div>

          {/* Obra Quick Filter */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 pl-2">Obra:</span>
            <select
              value={selectedObraId}
              onChange={(e) => onSelectObra(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 py-1 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-100">
                🏢 Todas las Obras ({obras.length})
              </option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id} className="bg-slate-900 text-slate-100">
                  {obra.code} - {obra.name}
                </option>
              ))}
              <option value="general" className="bg-slate-900 text-slate-100">
                🏛️ Administración & Central
              </option>
            </select>
          </div>

          {/* Quick Actions & Security */}
          <div className="flex items-center gap-2">
            {/* Sync status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <span
                className={`w-2 h-2 rounded-full bg-emerald-400 ${
                  isSyncing ? 'animate-ping' : ''
                }`}
              />
              <span className="font-mono text-[11px]">Sincronizado</span>
            </div>

            {/* AI Advisor Button */}
            <button
              onClick={handleAiAudit}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold hover:border-purple-400 hover:text-white transition shadow-sm"
              title="Auditoría Financiera en Tiempo Real con IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="hidden sm:inline">Auditor IA</span>
            </button>

            {/* Fast Entry Button */}
            <button
              onClick={handleFastEntry}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Cargar Operación</span>
            </button>

            {/* Excel Importer */}
            <button
              onClick={handleExcelModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
              title="Importar Excel con Gastos/Ingresos anteriores"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Importar Excel</span>
            </button>

            {/* MFA & Security Badge */}
            <button
              onClick={handleSecurityModal}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition"
              title="Autenticación Multifactor y Cifrado AES-256"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline font-mono text-[11px] text-slate-300">
                MFA Activo
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
