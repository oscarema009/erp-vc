import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  HardHat,
  Users2,
  Receipt,
  Boxes,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  FileSpreadsheet,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Obra, Transaction, Partner } from '../types';
import { ActiveTab } from './Sidebar';

interface DashboardProps {
  transactions: Transaction[];
  obras: Obra[];
  partners: Partner[];
  onSelectTab: (tab: ActiveTab) => void;
  onOpenExcelModal: () => void;
  onSelectObraFastEntry: (obraId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  obras,
  partners,
  onSelectTab,
  onOpenExcelModal,
  onSelectObraFastEntry,
}) => {
  // Financial computations
  const totalIncomes = transactions
    .filter((t) => t.type === 'ingreso')
    .reduce((a, b) => a + b.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'egreso')
    .reduce((a, b) => a + b.amount, 0);

  const netProfit = totalIncomes - totalExpenses;
  const marginPct = totalIncomes > 0 ? (netProfit / totalIncomes) * 100 : 0;

  // Taxes vs Payroll
  const totalTaxes = transactions
    .filter(
      (t) =>
        t.category === 'impuesto_iva' ||
        t.category === 'impuesto_ganancias_iibb' ||
        t.category === 'tasas_municipales'
    )
    .reduce((a, b) => a + b.amount, 0);

  const totalPayroll = transactions
    .filter(
      (t) =>
        t.category === 'personal_obreros' ||
        t.category === 'personal_staff' ||
        t.category === 'cargas_sociales'
    )
    .reduce((a, b) => a + b.amount, 0);

  const totalOperariosUocra = transactions
    .filter((t) => t.category === 'personal_obreros')
    .reduce((a, b) => a + b.amount, 0);

  const totalCargasSociales = transactions
    .filter((t) => t.category === 'cargas_sociales')
    .reduce((a, b) => a + b.amount, 0);

  const totalStaffTecnico = transactions
    .filter((t) => t.category === 'personal_staff')
    .reduce((a, b) => a + b.amount, 0);

  // Partner drawings
  const partnerDrawingsTotal = transactions
    .filter((t) => t.category === 'gastos_socios')
    .reduce((a, b) => a + b.amount, 0);

  // Total square meters in execution
  const totalM2 = obras.reduce((acc, o) => acc + o.squareMeters, 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              Construq ERP Enterprise
            </span>
            <span className="text-xs text-slate-400">· Ejercicio 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Panel de Control Financiero y Gestión de Obras
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Sincronización en tiempo real de certificaciones, gastos discriminados, utilidades de socios y control de materiales en obra.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onSelectTab('fast_entry')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cargar Gasto / Ingreso</span>
          </button>

          <button
            onClick={() => onSelectTab('ai_assistant')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auditor IA</span>
          </button>

          <button
            onClick={onOpenExcelModal}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Importar Excel</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Incomes */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Ingresos Certificados</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ${totalIncomes.toLocaleString('es-AR')}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Facturación de obra</span>
            <span className="text-emerald-400 font-semibold font-mono">+18.4% vs mes ant.</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        {/* Expenses */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Egresos Totales Ejecutados</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">
            ${totalExpenses.toLocaleString('es-AR')}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Materiales, nómina, tasas</span>
            <span className="text-slate-400 font-mono font-semibold">{transactions.filter(t => t.type === 'egreso').length} compras</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Utilidad Neta / Rendimiento</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${netProfit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
            ${netProfit.toLocaleString('es-AR')}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Margen de rentabilidad:</span>
            <span className="text-amber-400 font-bold font-mono">{marginPct.toFixed(1)}% Operativo</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
        </div>

        {/* Socios & Gerente Fee Summary */}
        <div
          onClick={() => onSelectTab('partners')}
          className="bg-slate-900 rounded-2xl border border-purple-500/30 p-5 shadow-lg relative overflow-hidden cursor-pointer hover:border-purple-500/60 transition"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-purple-300 mb-2">
            <span>Socios & Gerencia</span>
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-purple-300">
            4 Integrantes
          </div>
          <div className="mt-2 text-[11px] text-purple-400/90 truncate">
            Máximo 40%, Sergio 25%, Mario 25%, Gerente 10%
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
        </div>
      </div>

      {/* Two columns: Obras Status + Taxes/Payroll & Inventory Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Obras Performance Column */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-blue-400" />
                <span>Estado Financiero por Obra en Ejecución</span>
              </h2>
              <p className="text-xs text-slate-400">
                {obras.length} proyectos activos · {totalM2.toLocaleString()} m² en construcción
              </p>
            </div>
            <button
              onClick={() => onSelectTab('obras')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Ver detalle</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {obras.map((obra) => {
              const oIncomes = transactions
                .filter((t) => t.obraId === obra.id && t.type === 'ingreso')
                .reduce((a, b) => a + b.amount, 0);

              const oExpenses = transactions
                .filter((t) => t.obraId === obra.id && t.type === 'egreso')
                .reduce((a, b) => a + b.amount, 0);

              const oProfit = oIncomes - oExpenses;
              const oMargin = oIncomes > 0 ? (oProfit / oIncomes) * 100 : 0;

              return (
                <div
                  key={obra.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: obra.color }}
                      />
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{obra.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {obra.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {obra.client} · Resp: {obra.leadEngineer}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-[10px] text-slate-400">Margen Obra</div>
                        <div
                          className={`font-mono font-bold text-xs ${
                            oProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          ${oProfit.toLocaleString('es-AR')} ({oMargin.toFixed(0)}%)
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectObraFastEntry(obra.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition"
                        title="Cargar movimiento a esta obra"
                      >
                        + Cargar
                      </button>
                    </div>
                  </div>

                  {/* Progress & Quick Numbers */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-800/60 font-mono">
                    <div>
                      <span className="text-slate-500">Ingresos: </span>
                      <span className="text-emerald-400 font-semibold">${(oIncomes / 1000000).toFixed(1)}M</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Gastos: </span>
                      <span className="text-rose-400 font-semibold">${(oExpenses / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500">Avance Físico: </span>
                      <span className="text-blue-400 font-bold">{obra.progressPercentage}%</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${obra.progressPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Widgets: Taxes, Payroll & Critical Stock */}
        <div className="lg:col-span-4 space-y-6">
          {/* Taxes vs Payroll Widget */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                <span>Impuestos vs Nómina</span>
              </h3>
              <button
                onClick={() => onSelectTab('taxes_payroll')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Ver todo
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">Total Obligaciones Fiscales:</span>
                  <span className="font-mono font-bold text-rose-400">
                    ${totalTaxes.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">IVA, Anticipos Ganancias, IIBB y Tasas</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">Total Nómina & Cargas UOCRA:</span>
                  <span className="font-mono font-bold text-indigo-400">
                    ${totalPayroll.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">Sueldos operarios, Staff técnico y F931</div>
              </div>
            </div>
          </div>

          {/* Mano de Obra & Cuadrillas Activas Widget */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardHat className="w-4 h-4 text-indigo-400" />
                <span>Mano de Obra & Cuadrillas</span>
              </h3>
              <button
                onClick={() => onSelectTab('taxes_payroll')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Liquidación
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Jornales UOCRA (Cuadrillas)</div>
                  <div className="text-[10px] text-slate-500">Quincenas de oficiales y ayudantes</div>
                </div>
                <div className="text-right font-mono font-bold text-indigo-300">
                  ${totalOperariosUocra.toLocaleString('es-AR')}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Cargas Sociales AFIP (F931) + ART</div>
                  <div className="text-[10px] text-slate-500">Aportes patronales y cobertura</div>
                </div>
                <div className="text-right font-mono font-bold text-amber-300">
                  ${totalCargasSociales.toLocaleString('es-AR')}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Staff Técnico & Dirección</div>
                  <div className="text-[10px] text-slate-500">Jefes de obra, calculistas y seguridad</div>
                </div>
                <div className="text-right font-mono font-bold text-emerald-300">
                  ${totalStaffTecnico.toLocaleString('es-AR')}
                </div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Modelo de empresa: 100% prestación de mano de obra especializada.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ledger Transactions */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Últimos Movimientos Registrados</h2>
            <p className="text-xs text-slate-400">Transacciones contables recientes con imputación en vivo</p>
          </div>
          <button
            onClick={() => onSelectTab('fast_entry')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Ver libro completo →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Concepto</th>
                <th className="py-2.5 px-3">Obra / Imputación</th>
                <th className="py-2.5 px-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {transactions.slice(0, 6).map((tx) => {
                const obraObj = obras.find((o) => o.id === tx.obraId);
                const isIngreso = tx.type === 'ingreso';

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-300">{tx.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isIngreso
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {tx.description}
                      {tx.partnerId && (
                        <span className="ml-1.5 text-[11px] text-purple-400 font-semibold">
                          (Socio {partners.find((p) => p.id === tx.partnerId)?.name})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {obraObj ? obraObj.name : '🏛️ Administración'}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold ${
                        isIngreso ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isIngreso ? '+' : '-'}${tx.amount.toLocaleString('es-AR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
