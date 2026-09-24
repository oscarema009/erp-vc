import React, { useState } from 'react';
import {
  FileBarChart2,
  FileSpreadsheet,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Download,
  Filter,
} from 'lucide-react';
import { Obra, Transaction, InventoryItem, Partner } from '../types';
import { exportFullFinancialWorkbook } from '../services/excelService';

interface ReportsViewProps {
  transactions: Transaction[];
  obras: Obra[];
  partners: Partner[];
  inventory?: InventoryItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  obras,
  partners,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedObraFilter, setSelectedObraFilter] = useState('all');

  // Filtered transactions for report
  const filteredTx = transactions.filter((t) => {
    const matchesMonth = t.date.startsWith(selectedMonth);
    const matchesObra = selectedObraFilter === 'all' || t.obraId === selectedObraFilter;
    return matchesMonth && matchesObra;
  });

  const totalIncomes = filteredTx
    .filter((t) => t.type === 'ingreso')
    .reduce((a, b) => a + b.amount, 0);

  const totalExpenses = filteredTx
    .filter((t) => t.type === 'egreso')
    .reduce((a, b) => a + b.amount, 0);

  const netResult = totalIncomes - totalExpenses;
  const marginPct = totalIncomes > 0 ? (netResult / totalIncomes) * 100 : 0;

  // Breakdown by categories for visual chart
  const categoriesMap: Record<string, number> = {};
  filteredTx
    .filter((t) => t.type === 'egreso')
    .forEach((t) => {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
    });

  const topCategories = Object.entries(categoriesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Month history for comparative bars (simulate last 4 months)
  const monthHistory = [
    { month: 'Junio 2026', incomes: 42000000, expenses: 31000000 },
    { month: 'Julio 2026', incomes: 48000000, expenses: 35500000 },
    { month: 'Agosto 2026', incomes: 52000000, expenses: 39000000 },
    { month: 'Septiembre 2026', incomes: totalIncomes || 58500000, expenses: totalExpenses || 39500000 },
  ];

  const maxMonthValue = Math.max(...monthHistory.map((m) => Math.max(m.incomes, m.expenses)));

  const handleExportExcel = () => {
    exportFullFinancialWorkbook(transactions, obras, partners);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileBarChart2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Reportes Ejecutivos & Gráficos Comparativos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Generación de balances mensuales consolidados, estados de resultados por obra y exportación directa en formato Excel (.xlsx) y PDF.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel Oficial (.xlsx)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Período Mensual:</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="2026-09">Septiembre 2026 (Mes Actual)</option>
            <option value="2026-08">Agosto 2026</option>
            <option value="2026-07">Julio 2026</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filtrar Obra:</span>
          </div>
          <select
            value={selectedObraFilter}
            onChange={(e) => setSelectedObraFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Todas las Obras Consolidadas</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.code} - {o.name}
              </option>
            ))}
            <option value="general">Administración Central</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400">Ingresos Mensuales Certificados</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ${totalIncomes.toLocaleString('es-AR')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Certificaciones y anticipos facturados</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400">Egresos Ejecutados en Período</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">
            ${totalExpenses.toLocaleString('es-AR')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Materiales, nómina, impuestos y socios</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400">Utilidad Neta / Margen Operativo</div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              netResult >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ${netResult.toLocaleString('es-AR')} ({marginPct.toFixed(1)}%)
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Resultado neto del período seleccionado</div>
        </div>
      </div>

      {/* Comparative Visual Graph: Incomes vs Expenses by Month */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Evolución Comparativa Mensual (Ingresos vs Egresos)</h3>
            <p className="text-xs text-slate-400">Análisis comparativo de tendencia de flujo de caja</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-300">Ingresos</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-slate-300">Egresos</span>
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {monthHistory.map((m, idx) => {
            const incPct = maxMonthValue > 0 ? (m.incomes / maxMonthValue) * 100 : 0;
            const expPct = maxMonthValue > 0 ? (m.expenses / maxMonthValue) * 100 : 0;
            const marginMonth = m.incomes - m.expenses;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{m.month}</span>
                  <span className="font-mono text-emerald-400">
                    Utilidad: ${marginMonth.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="space-y-1">
                  {/* Incomes bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 w-16 text-right">
                      ${(m.incomes / 1000000).toFixed(1)}M
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${incPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Expenses bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-rose-400 w-16 text-right">
                      ${(m.expenses / 1000000).toFixed(1)}M
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-700"
                        style={{ width: `${expPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Expense Categories Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>Composición de Gastos por Categoría</span>
          </h3>

          <div className="space-y-3 text-xs">
            {topCategories.map(([cat, amt]) => {
              const pct = totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : '0';
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 capitalize">{cat.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-white font-bold">
                      ${amt.toLocaleString('es-AR')} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Obra Profitability Ranking */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Rentabilidad por Proyecto ({selectedMonth})</h3>
          <div className="space-y-3">
            {obras.map((o) => {
              const oInc = filteredTx
                .filter((t) => t.obraId === o.id && t.type === 'ingreso')
                .reduce((a, b) => a + b.amount, 0);

              const oExp = filteredTx
                .filter((t) => t.obraId === o.id && t.type === 'egreso')
                .reduce((a, b) => a + b.amount, 0);

              const oProf = oInc - oExp;

              return (
                <div
                  key={o.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{o.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Ingresos: ${oInc.toLocaleString('es-AR')} · Gastos: ${oExp.toLocaleString('es-AR')}
                    </div>
                  </div>
                  <div
                    className={`font-mono font-bold text-sm ${
                      oProf >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {oProf >= 0 ? '+' : ''}${oProf.toLocaleString('es-AR')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
