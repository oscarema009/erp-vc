import React, { useState } from 'react';
import {
  Boxes,
  PlusCircle,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  TrendingDown,
  Layers,
  Wrench,
  ShieldAlert,
  Building,
} from 'lucide-react';
import { InventoryItem, Obra } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  obras: Obra[];
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  obras,
  onAddInventoryItem,
  onUpdateInventoryItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<InventoryItem | null>(null);
  const [actionQuantity, setActionQuantity] = useState<string>('');
  const [actionType, setActionType] = useState<'consume' | 'restock' | 'transfer'>('consume');
  const [targetLocation, setTargetLocation] = useState<string>('obr-001');

  // Form states for new item
  const [newCode, setNewCode] = useState(`MAT-${Date.now().toString().slice(-4)}`);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<any>('material_grueso');
  const [newUnit, setNewUnit] = useState<any>('bolsas');
  const [newStock, setNewStock] = useState('100');
  const [newMinAlert, setNewMinAlert] = useState('30');
  const [newUnitCost, setNewUnitCost] = useState('8500');
  const [newLocation, setNewLocation] = useState('almacen_central');
  const [newSupplier, setNewSupplier] = useState('');

  // Total valuation
  const totalValuation = inventory.reduce(
    (acc, item) => acc + item.currentStock * item.unitCost,
    0
  );

  const lowStockCount = inventory.filter(
    (i) => i.currentStock <= i.minStockAlert
  ).length;

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLoc = locationFilter === 'all' || item.assignedLocation === locationFilter;
    return matchesSearch && matchesCat && matchesLoc;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      code: newCode.trim(),
      name: newName.trim(),
      category: newCategory,
      unit: newUnit,
      currentStock: parseFloat(newStock) || 0,
      minStockAlert: parseFloat(newMinAlert) || 10,
      unitCost: parseFloat(newUnitCost) || 0,
      assignedLocation: newLocation,
      lastRestockDate: new Date().toISOString().slice(0, 10),
      supplier: newSupplier.trim() || 'Proveedor Habitual',
    };

    onAddInventoryItem(newItem);
    setShowAddModal(false);
    setNewName('');
    setNewSupplier('');
  };

  const handleStockActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction) return;
    const qty = parseFloat(actionQuantity);
    if (!qty || qty <= 0) return;

    let updatedItem = { ...selectedItemForAction };

    if (actionType === 'consume') {
      updatedItem.currentStock = Math.max(0, updatedItem.currentStock - qty);
    } else if (actionType === 'restock') {
      updatedItem.currentStock += qty;
      updatedItem.lastRestockDate = new Date().toISOString().slice(0, 10);
    } else if (actionType === 'transfer') {
      updatedItem.assignedLocation = targetLocation;
    }

    onUpdateInventoryItem(updatedItem);
    setShowConsumeModal(false);
    setSelectedItemForAction(null);
    setActionQuantity('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-emerald-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Control de Inventario & Depósito en Obra
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Seguimiento de acopio en tiempo real, alarmas de quiebre de stock en obra, transferencias y control de consumos de materiales críticos.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Artículo / Insumo</span>
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 font-semibold">Valoración Total Stock Activo</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ${totalValuation.toLocaleString('es-AR')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{inventory.length} insumos catalogados</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Alertas de Stock Crítico</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              lowStockCount > 0 ? 'text-amber-400' : 'text-slate-200'
            }`}
          >
            {lowStockCount} Insumos Bajo Mínimo
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Requieren reposición urgente en obra</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 font-semibold">Ubicaciones & Puntos de Acopio</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {obras.length + 1} Depósitos
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">1 Almacén Central + {obras.length} Obras</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por material, código, proveedor..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Todas las Categorías</option>
            <option value="material_grueso">Material Grueso</option>
            <option value="hierro_acero">Hierro & Acero</option>
            <option value="herramientas">Herramientas</option>
            <option value="epp_seguridad">Seguridad & EPP</option>
            <option value="quimicos_aditivos">Químicos & Aditivos</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Todos los Depósitos</option>
            <option value="almacen_central">🏢 Depósito Central</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                🏗️ {o.code} - {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isLow = item.currentStock <= item.minStockAlert;
          const locName =
            item.assignedLocation === 'almacen_central'
              ? '🏢 Depósito Central'
              : obras.find((o) => o.id === item.assignedLocation)?.name || item.assignedLocation;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 shadow-lg transition bg-slate-900 ${
                isLow ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {item.code}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{item.name}</h4>
                </div>
                {isLow ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    ¡Stock Crítico!
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                    Normal
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5 truncate">
                <Building className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{locName}</span>
              </div>

              {/* Stock Numbers */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Stock Actual</div>
                  <div
                    className={`text-base font-mono font-black ${
                      isLow ? 'text-amber-400' : 'text-white'
                    }`}
                  >
                    {item.currentStock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Alerta Mínima</div>
                  <div className="text-base font-mono font-bold text-slate-400">
                    {item.minStockAlert} {item.unit}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 col-span-2 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Valuación ({item.unitCost}/u):</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${(item.currentStock * item.unitCost).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    setSelectedItemForAction(item);
                    setActionType('consume');
                    setShowConsumeModal(true);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold transition"
                >
                  Registrar Consumo
                </button>
                <button
                  onClick={() => {
                    setSelectedItemForAction(item);
                    setActionType('restock');
                    setShowConsumeModal(true);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold transition"
                >
                  Ingreso Stock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <span>Alta de Insumo / Material</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
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
                  <label className="block font-semibold text-slate-300 mb-1">Descripción del Material *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Cemento Loma Negra CPC 40..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="material_grueso">Material Grueso</option>
                    <option value="hierro_acero">Hierro & Acero</option>
                    <option value="herramientas">Herramientas</option>
                    <option value="epp_seguridad">Seguridad & EPP</option>
                    <option value="quimicos_aditivos">Químicos & Aditivos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unidad de Medida</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="bolsas">Bolsas (50kg)</option>
                    <option value="barras">Barras (12m)</option>
                    <option value="m3">Metros Cúbicos (m³)</option>
                    <option value="m2">Metros Cuadrados (m²)</option>
                    <option value="unidades">Unidades / Piezas</option>
                    <option value="kg">Kilogramos</option>
                    <option value="toneladas">Toneladas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Alerta Mínima</label>
                  <input
                    type="number"
                    required
                    value={newMinAlert}
                    onChange={(e) => setNewMinAlert(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    required
                    value={newUnitCost}
                    onChange={(e) => setNewUnitCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Depósito Asignado</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="almacen_central">🏢 Depósito Central</option>
                    {obras.map((o) => (
                      <option key={o.id} value={o.id}>
                        🏗️ {o.code} - {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Proveedor Habitual</label>
                  <input
                    type="text"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    placeholder="Ej: Corralón Central..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Guardar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Consumo / Restock Action */}
      {showConsumeModal && selectedItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {actionType === 'consume' ? 'Registrar Consumo en Obra' : 'Registrar Ingreso de Stock'}
              </h3>
              <button
                onClick={() => setShowConsumeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="font-bold text-white">{selectedItemForAction.name}</div>
              <div className="text-slate-400 mt-0.5">
                Stock actual:{' '}
                <span className="font-mono font-bold text-amber-400">
                  {selectedItemForAction.currentStock} {selectedItemForAction.unit}
                </span>
              </div>
            </div>

            <form onSubmit={handleStockActionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Cantidad a {actionType === 'consume' ? 'Descontar' : 'Agregar'} ({selectedItemForAction.unit}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={actionQuantity}
                  onChange={(e) => setActionQuantity(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-base focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConsumeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-bold text-white shadow-md ${
                    actionType === 'consume'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  Confirmar {actionType === 'consume' ? 'Consumo' : 'Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
