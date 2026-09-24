import React, { useState } from 'react';
import {
  HardHat,
  PlusCircle,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  User,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  CheckCircle,
} from 'lucide-react';
import { Obra, Transaction } from '../types';

interface ObrasViewProps {
  obras: Obra[];
  transactions: Transaction[];
  onAddObra: (obra: Obra) => void;
  onUpdateObra: (obra: Obra) => void;
  onSelectObraFastEntry: (obraId: string) => void;
}

export const ObrasView: React.FC<ObrasViewProps> = ({
  obras,
  transactions,
  onAddObra,
  onUpdateObra,
  onSelectObraFastEntry,
}) => {
  const [selectedObraId, setSelectedObraId] = useState<string>(obras[0]?.id || '');
  const [showNewObraModal, setShowNewObraModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_ejecucion' | 'planificacion' | 'finalizada'>('all');

  // Form states for new Obra
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState(`OBR-00${obras.length + 1}`);
  const [newClient, setNewClient] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newM2, setNewM2] = useState('');
  const [newLead, setNewLead] = useState('');

  const currentObra = obras.find((o) => o.id === selectedObraId) || obras[0];

  // Calculate financials for an obra
  const getObraFinancials = (obraId: string) => {
    const incomes = transactions
      .filter((t) => t.obraId === obraId && t.type === 'ingreso')
      .reduce((a, b) => a + b.amount, 0);

    const expenses = transactions
      .filter((t) => t.obraId === obraId && t.type === 'egreso')
      .reduce((a, b) => a + b.amount, 0);

    const profit = incomes - expenses;
    const marginPct = incomes > 0 ? (profit / incomes) * 100 : 0;

    // Expenses categories breakdown (Labor & Construction Services Model)
    const obrerosUocra = transactions
      .filter((t) => t.obraId === obraId && t.category === 'personal_obreros')
      .reduce((a, b) => a + b.amount, 0);

    const cargasSociales = transactions
      .filter((t) => t.obraId === obraId && t.category === 'cargas_sociales')
      .reduce((a, b) => a + b.amount, 0);

    const staffTecnico = transactions
      .filter((t) => t.obraId === obraId && t.category === 'personal_staff')
      .reduce((a, b) => a + b.amount, 0);

    const subcontratos = transactions
      .filter((t) => t.obraId === obraId && t.category === 'subcontratos')
      .reduce((a, b) => a + b.amount, 0);

    const herramientasEpp = transactions
      .filter((t) => t.obraId === obraId && (t.category === 'materiales' || t.category === 'maquinaria_alquiler'))
      .reduce((a, b) => a + b.amount, 0);

    const impuestos = transactions
      .filter((t) => t.obraId === obraId && (t.category === 'impuesto_iva' || t.category === 'tasas_municipales' || t.category === 'impuesto_ganancias_iibb'))
      .reduce((a, b) => a + b.amount, 0);

    return {
      incomes,
      expenses,
      profit,
      marginPct,
      obrerosUocra,
      cargasSociales,
      staffTecnico,
      subcontratos,
      herramientasEpp,
      impuestos,
    };
  };

  const handleCreateObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBudget) return;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const newObraItem: Obra = {
      id: `obr-${Date.now()}`,
      name: newName.trim(),
      code: newCode.trim() || `OBR-${Date.now().toString().slice(-3)}`,
      client: newClient.trim() || 'Cliente Particular',
      location: newLocation.trim() || 'Ubicación no especificada',
      status: 'en_ejecucion',
      startDate: new Date().toISOString().slice(0, 10),
      estimatedEndDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      budgetTotal: parseFloat(newBudget) || 10000000,
      progressPercentage: 5,
      squareMeters: parseFloat(newM2) || 500,
      leadEngineer: newLead.trim() || 'Jefe de Obra Asignado',
      color: colors[obras.length % colors.length],
    };

    onAddObra(newObraItem);
    setSelectedObraId(newObraItem.id);
    setShowNewObraModal(false);
    setNewName('');
    setNewBudget('');
    setNewM2('');
    setNewLead('');
    setNewClient('');
    setNewLocation('');
  };

  const currentFin = currentObra ? getObraFinancials(currentObra.id) : null;
  const filteredObras = obras.filter(
    (o) => statusFilter === 'all' || o.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-blue-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <HardHat className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Análisis y Control Financiero de Obras
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Monitoreo en tiempo real de ingresos certificados, egresos ejecutados, margen de rentabilidad y desglose por rubro para cada proyecto.
          </p>
        </div>

        <button
          onClick={() => setShowNewObraModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nueva Obra / Proyecto</span>
        </button>
      </div>

      {/* Project Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filteredObras.map((o) => {
          const fin = getObraFinancials(o.id);
          const isSelected = o.id === selectedObraId;

          return (
            <button
              key={o.id}
              onClick={() => setSelectedObraId(o.id)}
              className={`p-3 rounded-xl border text-left min-w-[220px] transition shrink-0 ${
                isSelected
                  ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-blue-400">{o.code}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    o.status === 'en_ejecucion'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {o.status.replace('_', ' ')}
                </span>
              </div>
              <div className="font-bold text-xs text-white truncate">{o.name}</div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
                <span>Avance: {o.progressPercentage}%</span>
                <span className={fin.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {fin.marginPct.toFixed(0)}% Mg.
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Obra Detailed Dashboard */}
      {currentObra && currentFin && (
        <div className="space-y-6">
          {/* Obra Header Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                    {currentObra.code}
                  </span>
                  <h2 className="text-xl font-black text-white">{currentObra.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cliente: {currentObra.client}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentObra.location}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Resp: {currentObra.leadEngineer}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentObra.squareMeters.toLocaleString()} m² construidos</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectObraFastEntry(currentObra.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Cargar Gasto / Ingreso a esta Obra</span>
                </button>
              </div>
            </div>

            {/* Progress Bar & Key Ratios */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">Presupuesto Contractual Total</div>
                <div className="text-base font-mono font-bold text-white">
                  ${currentObra.budgetTotal.toLocaleString('es-AR')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ${(currentObra.budgetTotal / (currentObra.squareMeters || 1)).toFixed(0)} / m²
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">Ingresos Certificados</div>
                <div className="text-base font-mono font-bold text-emerald-400">
                  ${currentFin.incomes.toLocaleString('es-AR')}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">
                  {((currentFin.incomes / currentObra.budgetTotal) * 100).toFixed(1)}% facturado
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">Gastos Totales Ejecutados</div>
                <div className="text-base font-mono font-bold text-rose-400">
                  ${currentFin.expenses.toLocaleString('es-AR')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ${(currentFin.expenses / (currentObra.squareMeters || 1)).toFixed(0)} ejecutado / m²
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">Margen Bruto de Obra</div>
                <div
                  className={`text-base font-mono font-black ${
                    currentFin.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ${currentFin.profit.toLocaleString('es-AR')} ({currentFin.marginPct.toFixed(1)}%)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Rentabilidad real a la fecha</div>
              </div>
            </div>

            {/* Physical vs Financial Progress */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Avance Físico de Obra:</span>
                <span className="font-mono text-blue-400">{currentObra.progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${currentObra.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Expenses by Category Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost Breakdown */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>Desglose de Costos por Rubro ({currentObra.code})</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Jornales Quincenales UOCRA (Oficiales/Ayudantes):</span>
                    <span className="font-mono text-white font-bold">
                      ${currentFin.obrerosUocra.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${currentFin.expenses > 0 ? (currentFin.obrerosUocra / currentFin.expenses) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Cargas Sociales AFIP (F931) & ART de Cuadrilla:</span>
                    <span className="font-mono text-white font-bold">
                      ${currentFin.cargasSociales.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{
                        width: `${currentFin.expenses > 0 ? (currentFin.cargasSociales / currentFin.expenses) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Staff Técnico, Jefatura & Seguridad de Obra:</span>
                    <span className="font-mono text-white font-bold">
                      ${currentFin.staffTecnico.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{
                        width: `${currentFin.expenses > 0 ? (currentFin.staffTecnico / currentFin.expenses) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Subcontratistas & Gremios Especializados:</span>
                    <span className="font-mono text-white font-bold">
                      ${currentFin.subcontratos.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{
                        width: `${currentFin.expenses > 0 ? (currentFin.subcontratos / currentFin.expenses) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Equipamiento, Andamios, Herramientas & EPP:</span>
                    <span className="font-mono text-white font-bold">
                      ${currentFin.herramientasEpp.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${currentFin.expenses > 0 ? (currentFin.herramientasEpp / currentFin.expenses) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Impuestos y Tasas Municipales Imputadas:</span>
                    <span className="font-mono text-white font-bold">
                      ${currentFin.impuestos.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{
                        width: `${currentFin.expenses > 0 ? (currentFin.impuestos / currentFin.expenses) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions for this obra */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-3">Movimientos Imputados a {currentObra.code}</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {transactions
                  .filter((t) => t.obraId === currentObra.id)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-100">{t.description}</div>
                        <div className="text-[11px] text-slate-500">
                          {t.date} · {t.receiptNumber || 'S/N'}
                        </div>
                      </div>
                      <div
                        className={`font-mono font-bold ${
                          t.type === 'ingreso' ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {t.type === 'ingreso' ? '+' : '-'}${t.amount.toLocaleString('es-AR')}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Obra */}
      {showNewObraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-blue-400" />
                <span>Alta de Nuevo Proyecto / Obra</span>
              </h3>
              <button
                onClick={() => setShowNewObraModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateObra} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Nombre de Obra *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Torre Los Sauces..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cliente / Fideicomiso</label>
                  <input
                    type="text"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="Ej: Fideicomiso Urbano"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ej: Av. Santa Fe 3400"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Presupuesto Total ($) *</label>
                  <input
                    type="number"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="120000000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    value={newM2}
                    onChange={(e) => setNewM2(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ingeniero / Arquitecto a Cargo</label>
                <input
                  type="text"
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
                  placeholder="Ej: Arq. Laura Benítez"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewObraModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20"
                >
                  Registrar Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
