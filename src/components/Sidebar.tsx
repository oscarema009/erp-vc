import React from 'react';
import {
  LayoutDashboard,
  HardHat,
  PlusCircle,
  Users2,
  Receipt,
  Boxes,
  FileBarChart2,
  Bot,
  MessageSquareCode,
  FileSpreadsheet,
  ShieldCheck,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'obras'
  | 'fast_entry'
  | 'partners'
  | 'taxes_payroll'
  | 'reports'
  | 'ai_assistant'
  | 'whatsapp_bot'
  | 'security';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenExcelModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  onOpenExcelModal,
}) => {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    sublabel?: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Panel General',
      sublabel: 'KPIs, flujos y balances',
      icon: LayoutDashboard,
    },
    {
      id: 'obras',
      label: 'Control de Obras',
      sublabel: 'Ingresos vs Egresos por obra',
      icon: HardHat,
      badge: '4 Activas',
      badgeColor: 'bg-blue-500/20 text-blue-400',
    },
    {
      id: 'fast_entry',
      label: 'Carga Especial',
      sublabel: 'Gastos, ingresos e impuestos',
      icon: PlusCircle,
      badge: 'Rápida',
      badgeColor: 'bg-amber-500/20 text-amber-300 font-bold',
    },
    {
      id: 'partners',
      label: 'Socios & Utilidades',
      sublabel: 'Máximo 50%, Sergio 25%, Mario 25%',
      icon: Users2,
      badge: 'Gerencia 20%',
      badgeColor: 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 'taxes_payroll',
      label: 'Impuestos & Nómina',
      sublabel: 'IVA, IIBB, UOCRA, F931',
      icon: Receipt,
      badge: 'Mano de Obra',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 font-semibold',
    },
    {
      id: 'reports',
      label: 'Reportes & Gráficos',
      sublabel: 'Exportar Excel y PDF mensual',
      icon: FileBarChart2,
    },
    {
      id: 'ai_assistant',
      label: 'Auditor Financiero IA',
      sublabel: 'Gemini 3.8 Flash en tiempo real',
      icon: Sparkles,
      badge: 'IA Real',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold',
    },
    {
      id: 'whatsapp_bot',
      label: 'Asistente WhatsApp',
      sublabel: 'Carga desde grupo de obra',
      icon: MessageSquareCode,
      badge: 'Bot Virtual',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 'security',
      label: 'Seguridad & MFA',
      sublabel: '2FA, Cifrado y Auditoría',
      icon: ShieldCheck,
    },
  ];

  const handleNavClick = (id: ActiveTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200">
      {/* Mobile Header with close */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
            CQ
          </div>
          <span className="font-bold text-white text-base">CONSTRUQ ERP</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Gestión Financiera
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold shadow-inner'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <div className="truncate">
                  <div className="text-sm tracking-tight truncate leading-snug">{item.label}</div>
                  {item.sublabel && (
                    <div className="text-[11px] text-slate-400 truncate leading-snug font-normal">
                      {item.sublabel}
                    </div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ml-2 ${
                    item.badgeColor || 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800/80">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Herramientas & Datos
          </p>
          <button
            onClick={() => {
              onOpenExcelModal();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition text-sm font-medium"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Cargar Excel Anterior</span>
          </button>
        </div>
      </div>

      {/* Footer Info & Security Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
            <Lock className="w-3 h-3 text-emerald-400" />
            Cifrado AES-256 Activo
          </span>
          <span className="font-mono text-[10px] text-slate-400">v2.6 Enterprise</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Empresa Constructora S.R.L. · CUIT 30-71829340-9
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-[calc(100vh-4rem)] sticky top-16 no-print">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
