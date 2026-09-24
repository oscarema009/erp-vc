import React, { useState } from 'react';
import {
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  Building,
  Users,
  CheckCircle2,
  Receipt,
  Sparkles,
  CreditCard,
  Search,
  Filter,
  Trash2,
  FileText,
} from 'lucide-react';
import { Transaction, Obra, Partner, TransactionType, CategoryId } from '../types';
import { CATEGORY_METADATA } from '../data/mockInitialData';

interface FastEntryViewProps {
  obras: Obra[];
  partners: Partner[];
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  defaultObraId?: string;
}

export const FastEntryView: React.FC<FastEntryViewProps> = ({
  obras,
  partners,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  defaultObraId,
}) => {
  const [type, setType] = useState<TransactionType>('egreso');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [obraId, setObraId] = useState<string>(defaultObraId && defaultObraId !== 'all' ? defaultObraId : 'obr-001');
  const [category, setCategory] = useState<CategoryId>('personal_obreros');
  const [paymentMethod, setPaymentMethod] = useState<'transferencia' | 'cheque' | 'efectivo' | 'tarjeta'>('transferencia');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string>('');
  const [applyIva, setApplyIva] = useState<boolean>(false);
  const [ivaRate, setIvaRate] = useState<number>(21);
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ingreso' | 'egreso'>('all');

  // Pre-configured quick templates focused on Labor & Specialized Construction Services
  const quickTemplates = [
    {
      label: 'Quincena Oficiales y Ayudantes UOCRA',
      type: 'egreso' as TransactionType,
      category: 'personal_obreros' as CategoryId,
      desc: 'Liquidación quincenal de cuadrilla en obra',
      pay: 'transferencia' as const,
      iva: false,
    },
    {
      label: 'Horas Extras & Rendimiento Cuadrilla',
      type: 'egreso' as TransactionType,
      category: 'personal_obreros' as CategoryId,
      desc: 'Jornales por avance acelerado y horas extras de obra',
      pay: 'transferencia' as const,
      iva: false,
    },
    {
      label: 'Cargas Sociales F931 AFIP & ART',
      type: 'egreso' as TransactionType,
      category: 'cargas_sociales' as CategoryId,
      desc: 'Pago aportes patronales F931 y seguro ART de cuadrilla',
      pay: 'transferencia' as const,
      iva: false,
    },
    {
      label: 'Certificado Avance Mano de Obra',
      type: 'ingreso' as TransactionType,
      category: 'certificacion_obra' as CategoryId,
      desc: 'Cobro certificación mensual por prestación de mano de obra',
      pay: 'transferencia' as const,
      iva: true,
      ivaRate: 21,
    },
    {
      label: 'Pago VEP AFIP (IVA / Ganancias)',
      type: 'egreso' as TransactionType,
      category: 'impuesto_iva' as CategoryId,
      desc: 'Pago declaración jurada mensual VEP AFIP',
      pay: 'transferencia' as const,
      iva: false,
    },
    {
      label: 'Retiro Cuenta Corriente Socio',
      type: 'egreso' as TransactionType,
      category: 'gastos_socios' as CategoryId,
      desc: 'Adelanto a cuenta de utilidades pactadas',
      pay: 'transferencia' as const,
      iva: false,
    },
  ];

  const handleApplyTemplate = (tpl: (typeof quickTemplates)[0]) => {
    setType(tpl.type);
    setCategory(tpl.category);
    setDescription(tpl.desc);
    setPaymentMethod(tpl.pay);
    setApplyIva(tpl.iva);
    if (tpl.ivaRate) setIvaRate(tpl.ivaRate);
    if (tpl.category === 'gastos_socios' && !partnerId) {
      setPartnerId('maximo');
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const netAmount = applyIva && type === 'egreso' ? numAmount / (1 + ivaRate / 100) : numAmount;
  const ivaAmount = applyIva && type === 'egreso' ? numAmount - netAmount : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || numAmount <= 0) return;
    if (!description.trim()) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type,
      date,
      amount: numAmount,
      currency: 'ARS',
      description: description.trim(),
      obraId: category === 'gastos_socios' || category === 'impuesto_iva' || category === 'impuesto_ganancias_iibb' || category === 'cargas_sociales' || category === 'personal_staff' ? (obraId || 'general') : obraId,
      category,
      partnerId: (category === 'gastos_socios' && partnerId ? partnerId : null) as any,
      taxDetail:
        applyIva && type === 'egreso'
          ? {
              hasIva: true,
              ivaRate,
              netAmount,
              ivaAmount,
            }
          : undefined,
      paymentMethod,
      receiptNumber: receiptNumber.trim() || undefined,
      status: 'conciliado',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);
    setAmount('');
    setDescription('');
    setReceiptNumber('');
    setNotes('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Filtered transaction list
  const filteredList = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.receiptNumber && t.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Carga Especial de Gastos e Ingresos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Ingreso rápido con discriminación contable de impuestos (IVA, IIBB), nómina UOCRA, materiales por obra y cuenta corriente de los socios (Máximo, Sergio y Mario).
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-700/60 shrink-0">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Registros Cargados</div>
            <div className="text-lg font-bold font-mono text-amber-400">{transactions.length} Operaciones</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Live Categorization Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
          {/* Quick Presets */}
          <div className="mb-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Plantillas Rápidas Frecuentes</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/80 text-xs text-slate-300 transition cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector toggle */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setType('egreso');
                  if (category === 'certificacion_obra' || category === 'anticipo_cliente') {
                    setCategory('materiales');
                  }
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition ${
                  type === 'egreso'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                <span>EGRESO / GASTO</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('ingreso');
                  setCategory('certificacion_obra');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition ${
                  type === 'ingreso'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>INGRESO / CERTIFICACIÓN</span>
              </button>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto Total ($ ARS) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    required
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fecha de Operación
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción / Concepto del Movimiento *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Compra de 150 bolsas de cemento Loma Negra, Quincena cuadrilla..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Obra & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>Obra Imputada</span>
                </label>
                <select
                  value={obraId}
                  onChange={(e) => setObraId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="general">🏛️ Gastos Centrales / Administración</option>
                  {obras.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code} - {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Categoría Contable
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as CategoryId;
                    setCategory(newCat);
                    if (newCat === 'gastos_socios' && !partnerId) {
                      setPartnerId('maximo');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {type === 'egreso' ? (
                    <>
                      <optgroup label="Impuestos & Tributario">
                        <option value="impuesto_iva">Impuesto: IVA (Compras / AFIP)</option>
                        <option value="impuesto_ganancias_iibb">Impuesto: Ganancias e IIBB</option>
                        <option value="tasas_municipales">Tasas Municipales y Derechos</option>
                      </optgroup>
                      <optgroup label="Personal & Leyes Sociales">
                        <option value="personal_obreros">Nómina Obreros UOCRA (Quincenal)</option>
                        <option value="personal_staff">Personal Staff & Dirección Técnica</option>
                        <option value="cargas_sociales">Cargas Sociales F931 y ART</option>
                      </optgroup>
                      <optgroup label="Obras e Insumos">
                        <option value="materiales">Materiales e Insumos de Construcción</option>
                        <option value="maquinaria_alquiler">Maquinaria, Grúas y Equipos</option>
                        <option value="subcontratos">Subcontratos Especializados</option>
                        <option value="logistica_combustible">Fletes, Logística y Combustible</option>
                      </optgroup>
                      <optgroup label="Empresa & Socios">
                        <option value="gastos_socios">Cuenta Corriente & Gastos de Socios</option>
                        <option value="administrativo_servicios">Gastos Administrativos Generales</option>
                      </optgroup>
                    </>
                  ) : (
                    <optgroup label="Ingresos de la Empresa">
                      <option value="certificacion_obra">Certificación de Avance de Obra</option>
                      <option value="anticipo_cliente">Anticipo Financiero de Cliente</option>
                      <option value="adicional_obra">Cobro Trabajos Adicionales</option>
                      <option value="venta_material_sobrante">Venta de Sobrante / Chatarra</option>
                      <option value="aporte_capital">Aporte de Capital</option>
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {/* If Category is Gastos Socios -> Select Partner */}
            {category === 'gastos_socios' && (
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                <label className="block text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Imputar Gasto / Retiro a Cuenta Corriente de Socio o Gerente:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {partners.map((p) => {
                    const isSelected = partnerId === p.id;
                    const isGerente = p.id === 'gerente';
                    const displayName = isGerente ? 'Gerente (Carlos)' : p.name.split(' ')[0];
                    const quotaText = p.id === 'maximo' ? '40% Neto' : isGerente ? '10% Cuota' : `${p.sharePercent}% Cuota`;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPartnerId(p.id)}
                        className={`p-2.5 rounded-xl text-xs font-semibold text-center transition border ${
                          isSelected
                            ? isGerente
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md ring-2 ring-purple-400/50'
                              : 'bg-purple-600 text-white border-purple-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-center gap-1">
                          <span>{displayName}</span>
                        </div>
                        <div className="text-[10px] opacity-80 mt-0.5">{quotaText}</div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-purple-300/80">
                  * Este monto se descontará automáticamente de la liquidación de utilidades del socio o gerente seleccionado.
                </p>
              </div>
            )}

            {/* Tax discrimination (IVA) for Expenses */}
            {type === 'egreso' && category !== 'gastos_socios' && category !== 'personal_obreros' && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyIva}
                      onChange={(e) => setApplyIva(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 bg-slate-900 border-slate-700"
                    />
                    <span>Discriminar IVA en la operación</span>
                  </label>
                  {applyIva && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Alícuota:</span>
                      <button
                        type="button"
                        onClick={() => setIvaRate(21)}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          ivaRate === 21
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        21%
                      </button>
                      <button
                        type="button"
                        onClick={() => setIvaRate(10.5)}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          ivaRate === 10.5
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        10.5%
                      </button>
                    </div>
                  )}
                </div>

                {applyIva && numAmount > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div className="text-slate-400">
                      Neto Gravado:{' '}
                      <span className="text-white font-bold">${netAmount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-rose-400 text-right">
                      Crédito Fiscal IVA ({ivaRate}%):{' '}
                      <span className="font-bold">${ivaAmount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method & Receipt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Medio de Pago</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="transferencia">🏦 Transferencia Bancaria</option>
                  <option value="cheque">📜 Cheque de Pago Diferido</option>
                  <option value="efectivo">💵 Efectivo / Caja Chica</option>
                  <option value="tarjeta">💳 Tarjeta Corporativa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nro. Comprobante / Factura</span>
                </label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Ej: FC-A 0004-00019283"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>CONFIRMAR E IMPUTAR OPERACIÓN AL SISTEMA</span>
              </button>
            </div>

            {showSuccessToast && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>¡Operación registrada con éxito y clasificada en la categoría correspondiente!</span>
              </div>
            )}
          </form>
        </div>

        {/* Live Accounting Classification Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Clasificación Contable en Vivo</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-0.5">Destino Presupuestario:</div>
                <div className="text-sm font-bold text-slate-200">
                  {obraId === 'general' ? '🏛️ Administración y Sede Central' : obras.find((o) => o.id === obraId)?.name || 'Obra no especificada'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-0.5">Categoría Imputada:</div>
                <div className="text-sm font-bold text-amber-400">
                  {CATEGORY_METADATA[category]?.label || category}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Grupo: <span className="uppercase text-slate-300 font-mono">{CATEGORY_METADATA[category]?.group}</span>
                </div>
              </div>

              {category === 'gastos_socios' && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40">
                  <div className="text-[11px] text-purple-300 font-semibold mb-1">Impacto Societario:</div>
                  <div className="text-xs text-purple-200">
                    Socio afectado: <span className="font-bold underline">{partners.find((p) => p.id === partnerId)?.name || 'No seleccionado'}</span>
                  </div>
                  <div className="text-[11px] text-purple-300/80 mt-1">
                    Se deduce de su <strong>cuota mensual de utilidades</strong> antes del pago de dividendos.
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">Impacto en Flujo de Caja:</div>
                <div className="text-base font-mono font-bold">
                  {type === 'ingreso' ? (
                    <span className="text-emerald-400">+ ${numAmount.toLocaleString('es-AR')}</span>
                  ) : (
                    <span className="text-rose-400">- ${numAmount.toLocaleString('es-AR')}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table: Search & Filter */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Libro Diario de Movimientos</h2>
            <p className="text-xs text-slate-400">Historial completo ordenado cronológicamente</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar descripción, factura..."
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('ingreso')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterType === 'ingreso' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
                }`}
              >
                Ingresos
              </button>
              <button
                onClick={() => setFilterType('egreso')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterType === 'egreso' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400'
                }`}
              >
                Egresos
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Concepto / Comprobante</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Obra / Imputación</th>
                <th className="py-2.5 px-3 text-right">Monto</th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredList.map((tx) => {
                const isIngreso = tx.type === 'ingreso';
                const catMeta = CATEGORY_METADATA[tx.category];
                const obraObj = obras.find((o) => o.id === tx.obraId);

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isIngreso
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-100">{tx.description}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {tx.receiptNumber ? `Fact: ${tx.receiptNumber}` : 'Sin comprobante'} · {tx.paymentMethod}
                        {tx.partnerId && (
                          <span className="ml-1 text-purple-400 font-sans font-semibold">
                            (Socio: {partners.find((p) => p.id === tx.partnerId)?.name})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${catMeta?.color || 'text-slate-300'}`}>
                        {catMeta?.label || tx.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 font-medium">
                      {obraObj ? (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: obraObj.color }}
                          />
                          <span>{obraObj.code}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">🏛️ Administración</span>
                      )}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        isIngreso ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isIngreso ? '+' : '-'}${tx.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
