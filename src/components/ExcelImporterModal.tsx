import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  X,
  ArrowRight,
  Database,
} from 'lucide-react';
import { Transaction } from '../types';
import { parseExcelOrCsvFile, downloadSampleExcelTemplate } from '../services/excelService';

interface ExcelImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (transactions: Transaction[]) => void;
}

export const ExcelImporterModal: React.FC<ExcelImporterModalProps> = ({
  isOpen,
  onClose,
  onImportTransactions,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Partial<Transaction>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setErrorMsg(null);
    setSuccessCount(null);

    try {
      const records = await parseExcelOrCsvFile(selectedFile);
      if (records.length === 0) {
        setErrorMsg('No se detectaron registros válidos en el archivo.');
      } else {
        setParsedData(records);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el archivo Excel / CSV.');
      setParsedData([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    const completedTransactions: Transaction[] = parsedData.map((p, idx) => ({
      id: p.id || `tx-imp-${Date.now()}-${idx}`,
      type: p.type || 'egreso',
      date: p.date || new Date().toISOString().slice(0, 10),
      amount: p.amount || 0,
      currency: 'ARS',
      description: p.description || 'Importación de Excel histórico',
      obraId: p.obraId || 'general',
      category: (p.category as any) || 'materiales',
      partnerId: p.partnerId || null,
      paymentMethod: p.paymentMethod || 'transferencia',
      receiptNumber: p.receiptNumber,
      status: 'conciliado',
      createdAt: new Date().toISOString(),
    }));

    onImportTransactions(completedTransactions);
    setSuccessCount(completedTransactions.length);
    setTimeout(() => {
      onClose();
      setParsedData([]);
      setFile(null);
      setSuccessCount(null);
    }, 1800);
  };

  const totalImportAmount = parsedData.reduce((a, b) => a + (b.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Importador de Planillas Excel / CSV</h3>
              <p className="text-xs text-slate-400">
                Carga de gastos e ingresos anteriores al primer uso de la plataforma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Download Template Banner */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-slate-200">¿No tienes el formato estándar?</div>
            <div className="text-slate-400 text-[11px]">
              Descarga la plantilla oficial en Excel (.xlsx) con columnas preconfiguradas.
            </div>
          </div>
          <button
            type="button"
            onClick={downloadSampleExcelTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold border border-slate-700 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Plantilla</span>
          </button>
        </div>

        {/* Drag and drop upload zone */}
        <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-950/40">
          <UploadCloud className="w-10 h-10 text-emerald-400 animate-pulse" />
          <div className="text-sm font-bold text-slate-200">
            {file ? file.name : 'Haz clic o arrastra aquí tu archivo .xlsx o .csv'}
          </div>
          <div className="text-[11px] text-slate-400">
            Compatible con Excel 97-2024 (.xlsx, .xls) y valores separados por coma (.csv)
          </div>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {isParsing && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <span>Procesando celdas y validando columnas del archivo...</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successCount !== null && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>¡Se importaron exitosamente {successCount} transacciones a la base de datos!</span>
          </div>
        )}

        {/* Preview of Parsed Data */}
        {parsedData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Vista Previa: {parsedData.length} Movimientos Identificados</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                Total Acumulado: ${totalImportAmount.toLocaleString('es-AR')}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase sticky top-0">
                  <tr>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Concepto</th>
                    <th className="p-2 text-right">Monto ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {parsedData.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-mono text-slate-400">{row.date}</td>
                      <td className="p-2 uppercase text-[10px] font-bold text-amber-400">{row.type}</td>
                      <td className="p-2 text-slate-200 truncate max-w-[200px]">{row.description}</td>
                      <td className="p-2 text-right font-mono font-bold text-white">
                        ${row.amount?.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 10 && (
                <div className="p-2 text-center text-[11px] text-slate-500 bg-slate-900/50">
                  ... y {parsedData.length - 10} registros adicionales listos para incorporar.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Incorporar {parsedData.length} Registros a la Contabilidad</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
