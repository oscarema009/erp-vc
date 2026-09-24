import React, { useState } from 'react';
import {
  Users2,
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  FileCheck2,
  Printer,
  PlusCircle,
  AlertCircle,
  Award,
  Wallet,
  Building,
  UserCheck,
} from 'lucide-react';
import { Partner, Transaction, PartnerId } from '../types';

interface PartnersViewProps {
  partners: Partner[];
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  transactions,
  onAddTransaction,
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<'all' | PartnerId>('all');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expensePartner, setExpensePartner] = useState<PartnerId>('maximo');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [showActaModal, setShowActaModal] = useState(false);

  // Financial calculations
  // Total Incomes
  const totalIncomes = transactions
    .filter((t) => t.type === 'ingreso')
    .reduce((a, b) => a + b.amount, 0);

  // Total operating expenses (excluding partner personal retiros to avoid double counting from net profit base)
  const totalOpExpenses = transactions
    .filter((t) => t.type === 'egreso' && t.category !== 'gastos_socios')
    .reduce((a, b) => a + b.amount, 0);

  const companyNetProfit = totalIncomes - totalOpExpenses;

  // Partner calculations:
  // Máximo: 50% nominal. Gerente takes 20% of Máximo's quota (i.e. 20% * 50% = 10% of total company profit). Máximo gets 40% net.
  // Sergio: 25%
  // Mario: 25%
  // Gerente: 10% (proveniente del 20% de Máximo). Tiene asignación de utilidad propia y se le imputan gastos personales.
  const managerFeePercent = 10; // 20% of 50%
  const managerFeeAmount = companyNetProfit > 0 ? companyNetProfit * 0.10 : 0;

  const partnerMetrics = partners.map((p) => {
    let grossPercent = p.sharePercent;
    let netPercent = p.sharePercent;
    let managerAdjustment = 0; // Negative for Maximo, positive/base for Gerente

    if (p.id === 'maximo') {
      managerAdjustment = companyNetProfit > 0 ? -(companyNetProfit * 0.50 * 0.20) : 0;
      netPercent = 40; // 50% minus 10%
    } else if (p.id === 'gerente') {
      grossPercent = 10;
      netPercent = 10;
      managerAdjustment = companyNetProfit > 0 ? companyNetProfit * 0.10 : 0;
    }

    const grossQuota = companyNetProfit > 0 ? (companyNetProfit * grossPercent) / 100 : 0;
    const netQuota = p.id === 'maximo'
      ? grossQuota + managerAdjustment
      : p.id === 'gerente'
      ? (companyNetProfit > 0 ? companyNetProfit * 0.10 : 0)
      : grossQuota;

    const partnerExpenses = transactions
      .filter((t) => t.type === 'egreso' && t.partnerId === p.id)
      .reduce((a, b) => a + b.amount, 0);

    const netDividendPayable = netQuota - partnerExpenses;
    const expenseUsagePercent = netQuota > 0 ? Math.min(100, (partnerExpenses / netQuota) * 100) : 0;

    return {
      partner: p,
      grossPercent,
      netPercent,
      grossQuota,
      managerAdjustment,
      netQuota,
      partnerExpenses,
      netDividendPayable,
      expenseUsagePercent,
    };
  });

  const handleCreatePartnerExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!amt || amt <= 0 || !expenseDesc.trim()) return;

    const newTx: Transaction = {
      id: `tx-part-${Date.now()}`,
      type: 'egreso',
      date: expenseDate,
      amount: amt,
      currency: 'ARS',
      description: `Retiro/Gasto Socio: ${expenseDesc.trim()}`,
      obraId: 'general',
      category: 'gastos_socios',
      partnerId: expensePartner,
      paymentMethod: 'transferencia',
      status: 'conciliado',
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);
    setExpenseAmount('');
    setExpenseDesc('');
    setShowAddExpenseModal(false);
  };

  const partnerTransactions = transactions.filter(
    (t) => t.category === 'gastos_socios' && (selectedPartnerId === 'all' || t.partnerId === selectedPartnerId)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-purple-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Users2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Cuenta Corriente de Socios & Distribución de Utilidades
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Estructura societaria integrada: <strong>Máximo (40% neto / 50% nom.)</strong>, <strong>Sergio (25%)</strong>, <strong>Mario (25%)</strong> y el <strong>Gerente General (10% cedido por el mayoritario)</strong>. Cada uno dispone de carga de gastos personales y liquidación individualizada en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Gasto de Socio / Gerente</span>
          </button>

          <button
            onClick={() => setShowActaModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            <span>Acta Mensual Automatizada</span>
          </button>
        </div>
      </div>

      {/* Global Net Profit Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>Ingresos Brutos Empresa</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ${totalIncomes.toLocaleString('es-AR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total certificaciones y cobros</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>Egresos Operativos Obras</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">
            ${totalOpExpenses.toLocaleString('es-AR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Nómina, mano de obra e impuestos</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>Utilidad Neta a Distribuir</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            ${companyNetProfit.toLocaleString('es-AR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">100% asignable a socios y gerencia</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 shadow-md">
          <div className="text-xs font-semibold text-purple-300 flex items-center justify-between">
            <span>Cuota Gerente General (10%)</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">
            ${managerFeeAmount.toLocaleString('es-AR')}
          </div>
          <div className="text-[11px] text-purple-400/80 mt-1">20% deducido del 50% de Máximo</div>
        </div>
      </div>

      {/* Partners Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {partnerMetrics.map((pm) => {
          const isMaximo = pm.partner.id === 'maximo';
          const isGerente = pm.partner.id === 'gerente';
          const isSurplus = pm.netDividendPayable >= 0;

          return (
            <div
              key={pm.partner.id}
              className={`rounded-2xl border p-5 shadow-xl transition relative overflow-hidden bg-slate-900 flex flex-col justify-between ${
                isMaximo
                  ? 'border-amber-500/40 ring-1 ring-amber-500/20'
                  : isGerente
                  ? 'border-purple-500/40 ring-1 ring-purple-500/20 bg-purple-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Partner Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${pm.partner.avatarBg} flex items-center justify-center text-white font-black text-lg shadow-md shrink-0`}
                    >
                      {pm.partner.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{pm.partner.name}</span>
                        {isMaximo && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                            Mayoritario
                          </span>
                        )}
                        {isGerente && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase">
                            Socio Gerente
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{pm.partner.role}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg border ${
                      isGerente
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-slate-800 text-amber-400 border-slate-700'
                    }`}>
                      {pm.netPercent}% Cuota
                    </span>
                  </div>
                </div>

                {/* Formula & Rule Box for Máximo or Gerente */}
                {isMaximo && (
                  <div className="mb-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-tight">
                    <span className="font-bold">Regla Gerencia:</span> 50% nominal (-20% al Gerente = $
                    {Math.abs(pm.managerAdjustment).toLocaleString('es-AR')}). Cuota neta efectiva:{' '}
                    <strong>40%</strong>.
                  </div>
                )}

                {isGerente && (
                  <div className="mb-4 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 leading-tight">
                    <span className="font-bold">Participación Gerencial:</span> Percibe el 20% de la cuota de Máximo (10% de la empresa: ${pm.netQuota.toLocaleString('es-AR')}). Sus gastos personales se deducen aquí.
                  </div>
                )}

                {/* Financial Breakdowns */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">
                      {isGerente ? 'Cuota Asignada (10% Emp.):' : 'Utilidad Bruta Asignada:'}
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">
                      ${(isGerente ? pm.netQuota : pm.grossQuota).toLocaleString('es-AR')}
                    </span>
                  </div>

                  {isMaximo && (
                    <div className="flex justify-between py-1 border-b border-slate-800/80 text-purple-300">
                      <span>(-) Deducción Gerencia (20%):</span>
                      <span className="font-mono font-semibold">
                        -${Math.abs(pm.managerAdjustment).toLocaleString('es-AR')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Cuota Neta Disponible:</span>
                    <span className="font-mono text-white font-bold">
                      ${pm.netQuota.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/80 text-rose-400">
                    <span>(-) Gastos y Retiros Imputados:</span>
                    <span className="font-mono font-bold">
                      -${pm.partnerExpenses.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {/* Progress bar of drawings vs net quota */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Consumo de Utilidades:</span>
                      <span className="font-mono font-bold text-slate-300">
                        {pm.expenseUsagePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pm.expenseUsagePercent > 80
                            ? 'bg-rose-500'
                            : pm.expenseUsagePercent > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pm.expenseUsagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Dividend to Pay */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-0.5">Saldo Neto a Percibir este Mes:</div>
                <div
                  className={`text-lg font-mono font-black ${
                    isSurplus ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isSurplus ? '+' : ''}${pm.netDividendPayable.toLocaleString('es-AR')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {isSurplus ? 'Disponible para transferencia' : 'Saldo deudor a compensar'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Partner Expense History Log */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Registro de Retiros y Gastos de Socios & Gerente</h2>
            <p className="text-xs text-slate-400">
              Detalle de consumos, adelantos y gastos personales imputados a cada cuenta corriente
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtrar por Integrante:</span>
            <select
              value={selectedPartnerId}
              onChange={(e: any) => setSelectedPartnerId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">Todos los Socios y Gerencia</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id === 'maximo' ? '40% Neto' : p.id === 'gerente' ? '10% Gerencia' : `${p.sharePercent}%`})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Socio / Gerente</th>
                <th className="py-2.5 px-3">Concepto / Justificación</th>
                <th className="py-2.5 px-3">Medio</th>
                <th className="py-2.5 px-3 text-right">Importe Retirado</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {partnerTransactions.map((tx) => {
                const partnerObj = partners.find((p) => p.id === tx.partnerId);

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-300">{tx.date}</td>
                    <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{partnerObj ? partnerObj.name : 'Socio No Especificado'}</span>
                        {tx.partnerId === 'gerente' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                            Gerente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-200">{tx.description}</div>
                      {tx.notes && <div className="text-[11px] text-slate-400">{tx.notes}</div>}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-400">{tx.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                      -${tx.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Imputado
                      </span>
                    </td>
                  </tr>
                );
              })}
              {partnerTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No se registran retiros ni gastos para el integrante seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Gasto de Socio o Gerente */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-400" />
                <span>Nuevo Retiro / Gasto de Socio o Gerente</span>
              </h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePartnerExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Imputar a Cuenta Corriente de *</label>
                <select
                  value={expensePartner}
                  onChange={(e: any) => setExpensePartner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white cursor-pointer"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.id === 'maximo' ? '(40% Neto / Mayoritario)' : p.id === 'gerente' ? '(10% Cuota Gerencial)' : `(${p.sharePercent}% Cuota)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Monto del Retiro / Gasto ($ ARS) *</label>
                <input
                  type="number"
                  required
                  step="any"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Concepto / Motivo *</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Ej: Adelanto utilidades personales, combustible particular..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Fecha</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20"
                >
                  Guardar Retiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Acta Mensual de Distribución de Utilidades Automatizada */}
      {showActaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print-card">
            {/* Header with Print */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 no-print">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-400" />
                  <span>Acta Oficial de Liquidación y Distribución de Utilidades</span>
                </h3>
                <p className="text-xs text-slate-400">Emisión automatizada para firma y archivo contable</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  onClick={() => setShowActaModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-5 text-slate-200 font-serif leading-relaxed text-xs sm:text-sm">
              <div className="text-center pb-3 border-b border-slate-800">
                <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-amber-400">
                  CONSTRUQ EMPRESA CONSTRUCTORA S.R.L.
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  CUIT: 30-71829340-9 · Sede Legal: Ciudad Autónoma de Buenos Aires
                </p>
                <p className="text-xs font-bold text-slate-300 font-sans mt-1">
                  ACTA DE REUNIÓN DE SOCIOS Y GERENCIA: LIQUIDACIÓN MENSUAL DE UTILIDADES
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Período Liquidado: Septiembre 2026 · Fecha de Emisión:{' '}
                  {new Date().toLocaleDateString('es-AR')}
                </p>
              </div>

              <p>
                En la sede social de la firma, se reúnen los señores socios{' '}
                <strong>Máximo Benítez</strong> (titular del 50% nominal del capital social),{' '}
                <strong>Sergio Navarro</strong> (titular del 25%), <strong>Mario Rossi</strong>{' '}
                (titular del 25%) y el <strong>Ing. Carlos Mendoza</strong> (Socio Gerente General, con participación
                estatutaria del 20% deducida directamente de la cuota del socio mayoritario), a efectos de analizar
                el estado contable mensual y proceder a la distribución de utilidades y compensación de gastos de cada integrante.
              </p>

              {/* Economic Balance Summary Table */}
              <div className="font-sans my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-2">
                  1. Liquidación Económica del Período
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Ingresos Certificados Totales:</div>
                  <div className="text-right font-mono font-bold text-emerald-400">
                    ${totalIncomes.toLocaleString('es-AR')}
                  </div>
                  <div>Egresos Operativos Obras & Impuestos:</div>
                  <div className="text-right font-mono font-bold text-rose-400">
                    -${totalOpExpenses.toLocaleString('es-AR')}
                  </div>
                  <div className="border-t border-slate-800 pt-1 font-bold">Utilidad Neta a Distribuir:</div>
                  <div className="border-t border-slate-800 pt-1 text-right font-mono font-black text-amber-400">
                    ${companyNetProfit.toLocaleString('es-AR')}
                  </div>
                </div>
              </div>

              {/* Distribution by partner table */}
              <div className="font-sans my-4">
                <div className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-2">
                  2. Distribución Individualizada de Socios y Gerencia
                </div>
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Integrante</th>
                      <th className="p-2 border-b border-slate-800">Cuota (%)</th>
                      <th className="p-2 border-b border-slate-800">Utilidad Asignada</th>
                      <th className="p-2 border-b border-slate-800">Ajuste Pacto</th>
                      <th className="p-2 border-b border-slate-800">Gastos / Retiros</th>
                      <th className="p-2 border-b border-slate-800 text-right">Neto a Liquidar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {partnerMetrics.map((pm) => (
                      <tr key={pm.partner.id}>
                        <td className="p-2 font-sans font-bold text-white">
                          {pm.partner.name}
                          {pm.partner.id === 'gerente' && ' (Socio Gerente)'}
                        </td>
                        <td className="p-2">{pm.netPercent}%</td>
                        <td className="p-2">${(pm.partner.id === 'gerente' ? pm.netQuota : pm.grossQuota).toLocaleString('es-AR')}</td>
                        <td className="p-2 text-purple-300">
                          {pm.partner.id === 'maximo'
                            ? `-$${Math.abs(pm.managerAdjustment).toLocaleString('es-AR')} (-20%)`
                            : pm.partner.id === 'gerente'
                            ? `+$${pm.netQuota.toLocaleString('es-AR')} (+20% Máximo)`
                            : '$0'}
                        </td>
                        <td className="p-2 text-rose-400">
                          -${pm.partnerExpenses.toLocaleString('es-AR')}
                        </td>
                        <td className={`p-2 text-right font-bold ${pm.netDividendPayable >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ${pm.netDividendPayable.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>
                Los socios y el gerente general prestan unánime conformidad a las cifras expuestas y autorizan
                la transferencia bancaria inmediata de los saldos netos resultantes a las cuentas bancarias declaradas por cada titular.
              </p>

              {/* Signatures */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 font-sans text-center text-xs">
                <div className="border-t border-slate-600 pt-2">
                  <div className="font-bold text-white">Máximo Benítez</div>
                  <div className="text-[10px] text-slate-400">Socio Mayoritario (40% Neto)</div>
                </div>
                <div className="border-t border-slate-600 pt-2">
                  <div className="font-bold text-white">Sergio Navarro</div>
                  <div className="text-[10px] text-slate-400">Socio Operaciones (25%)</div>
                </div>
                <div className="border-t border-slate-600 pt-2">
                  <div className="font-bold text-white">Mario Rossi</div>
                  <div className="text-[10px] text-slate-400">Socio Técnico (25%)</div>
                </div>
                <div className="border-t border-purple-500/60 pt-2 bg-purple-950/20 rounded-b-lg">
                  <div className="font-bold text-purple-300">Ing. Carlos Mendoza</div>
                  <div className="text-[10px] text-purple-400">Socio Gerente General (10%)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
