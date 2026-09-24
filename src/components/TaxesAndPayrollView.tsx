import React, { useState } from 'react';
import {
  Receipt,
  Users,
  ShieldCheck,
  TrendingDown,
  Building,
  FileSpreadsheet,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { Transaction } from '../types';

interface TaxesAndPayrollViewProps {
  transactions: Transaction[];
}

export const TaxesAndPayrollView: React.FC<TaxesAndPayrollViewProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'impuestos' | 'personal'>('all');

  // Impuestos
  const ivaTx = transactions.filter((t) => t.category === 'impuesto_iva');
  const gananciasTx = transactions.filter((t) => t.category === 'impuesto_ganancias_iibb');
  const tasasTx = transactions.filter((t) => t.category === 'tasas_municipales');

  const totalIva = ivaTx.reduce((a, b) => a + b.amount, 0);
  const totalGanancias = gananciasTx.reduce((a, b) => a + b.amount, 0);
  const totalTasas = tasasTx.reduce((a, b) => a + b.amount, 0);
  const totalImpuestos = totalIva + totalGanancias + totalTasas;

  // Personal y Nómina
  const obrerosTx = transactions.filter((t) => t.category === 'personal_obreros');
  const staffTx = transactions.filter((t) => t.category === 'personal_staff');
  const cargasTx = transactions.filter((t) => t.category === 'cargas_sociales');

  const totalObreros = obrerosTx.reduce((a, b) => a + b.amount, 0);
  const totalStaff = staffTx.reduce((a, b) => a + b.amount, 0);
  const totalCargas = cargasTx.reduce((a, b) => a + b.amount, 0);
  const totalPersonal = totalObreros + totalStaff + totalCargas;

  const totalExpenses = transactions
    .filter((t) => t.type === 'egreso')
    .reduce((a, b) => a + b.amount, 0);

  const taxRatio = totalExpenses > 0 ? ((totalImpuestos / totalExpenses) * 100).toFixed(1) : '0';
  const payrollRatio = totalExpenses > 0 ? ((totalPersonal / totalExpenses) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950/50 via-slate-900 to-indigo-950/50 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Diferenciación de Impuestos & Gastos de Personal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Control discriminado de obligaciones fiscales (IVA, Ganancias, IIBB, Tasas) frente a la masa salarial y leyes sociales (UOCRA, Staff y Formulario 931 AFIP).
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Vista Integral
          </button>
          <button
            onClick={() => setActiveTab('impuestos')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'impuestos' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'
            }`}
          >
            Solo Impuestos
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'personal' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'
            }`}
          >
            Solo Personal
          </button>
        </div>
      </div>

      {/* Ratios & Comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Impuestos Card */}
        <div className="bg-slate-900 rounded-2xl border border-rose-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Carga Fiscal & Tributaria</h3>
                <p className="text-xs text-rose-400/80">Representa el {taxRatio}% de los egresos totales</p>
              </div>
            </div>
            <div className="text-right font-mono font-black text-rose-400 text-lg">
              ${totalImpuestos.toLocaleString('es-AR')}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-200">Impuesto al Valor Agregado (IVA)</div>
                <div className="text-[11px] text-slate-500">Posiciones mensuales AFIP y débitos</div>
              </div>
              <div className="font-mono font-bold text-white">${totalIva.toLocaleString('es-AR')}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-200">Ganancias e Ingresos Brutos (IIBB)</div>
                <div className="text-[11px] text-slate-500">Anticipos fiscales y percepciones provinciales</div>
              </div>
              <div className="font-mono font-bold text-white">${totalGanancias.toLocaleString('es-AR')}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-200">Tasas Municipales y Derechos de Obra</div>
                <div className="text-[11px] text-slate-500">Permisos de construcción e inspección</div>
              </div>
              <div className="font-mono font-bold text-white">${totalTasas.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>

        {/* Personal & Leyes Sociales Card */}
        <div className="bg-slate-900 rounded-2xl border border-indigo-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Masa Salarial & Personal</h3>
                <p className="text-xs text-indigo-400/80">Representa el {payrollRatio}% de los egresos totales</p>
              </div>
            </div>
            <div className="text-right font-mono font-black text-indigo-400 text-lg">
              ${totalPersonal.toLocaleString('es-AR')}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-200">Nómina Quincenal Operarios (UOCRA)</div>
                <div className="text-[11px] text-slate-500">Jornales, oficiales armadores y albañiles</div>
              </div>
              <div className="font-mono font-bold text-white">${totalObreros.toLocaleString('es-AR')}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-200">Staff Técnico, Jefes de Obra & Dirección</div>
                <div className="text-[11px] text-slate-500">Arquitectos, ingenieros y supervisores</div>
              </div>
              <div className="font-mono font-bold text-white">${totalStaff.toLocaleString('es-AR')}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-200">Cargas Sociales, F931 AFIP y ART</div>
                <div className="text-[11px] text-slate-500">Aportes patronales, obra social y seguro de vida</div>
              </div>
              <div className="font-mono font-bold text-white">${totalCargas.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <h3 className="text-base font-bold text-white mb-3">Detalle Cronológico de Comprobantes Impositivos y Sueldos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Rubro</th>
                <th className="py-2.5 px-3">Concepto</th>
                <th className="py-2.5 px-3">N° Comprobante / VEP</th>
                <th className="py-2.5 px-3">Medio</th>
                <th className="py-2.5 px-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {transactions
                .filter((t) => {
                  const isTax =
                    t.category === 'impuesto_iva' ||
                    t.category === 'impuesto_ganancias_iibb' ||
                    t.category === 'tasas_municipales';
                  const isPay =
                    t.category === 'personal_obreros' ||
                    t.category === 'personal_staff' ||
                    t.category === 'cargas_sociales';

                  if (activeTab === 'impuestos') return isTax;
                  if (activeTab === 'personal') return isPay;
                  return isTax || isPay;
                })
                .map((t) => {
                  const isTax =
                    t.category === 'impuesto_iva' ||
                    t.category === 'impuesto_ganancias_iibb' ||
                    t.category === 'tasas_municipales';

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-300">{t.date}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isTax
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {isTax ? 'Impuesto' : 'Personal'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{t.description}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{t.receiptNumber || 'S/N'}</td>
                      <td className="py-2.5 px-3 capitalize text-slate-400">{t.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                        -${t.amount.toLocaleString('es-AR')}
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
