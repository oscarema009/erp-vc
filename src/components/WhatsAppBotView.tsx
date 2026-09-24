import React, { useState } from 'react';
import {
  MessageSquareCode,
  Smartphone,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  PlusCircle,
  QrCode,
} from 'lucide-react';
import { Transaction, Obra, Partner } from '../types';
import { parseWhatsAppMessageWithAI } from '../services/geminiService';

interface WhatsAppBotViewProps {
  obras: Obra[];
  partners: Partner[];
  onAddTransaction: (tx: Transaction) => void;
}

export const WhatsAppBotView: React.FC<WhatsAppBotViewProps> = ({
  obras,
  partners,
  onAddTransaction,
}) => {
  const [sampleMessage, setSampleMessage] = useState(
    'Gasto 650000 flete de arena y piedras para Torre Aurora factura FC-A 0012-9912 con transferencia'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const quickMessages = [
    'Gasto 650000 flete de arena y piedras para Torre Aurora factura FC-A 0012-9912 con transferencia',
    'Ingreso 4800000 cobro certificado de avance Torre Los Sauces',
    'Retiro socio Mario 180000 para adelanto particular transferencia',
    'Pago quincena cuadrilla UOCRA Parque Industrial 2100000 efectivo',
    'Compra de 120 bolsas de cemento Loma Negra 980000 para Centro Logistico con cheque',
  ];

  const handleParseMessage = async (textToParse?: string) => {
    const text = textToParse || sampleMessage;
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setParsedPreview(null);

    try {
      const obrasList = obras.map((o) => ({ id: o.id, code: o.code, name: o.name }));
      const partnersList = partners.map((p) => ({ id: p.id, name: p.name }));

      const result = await parseWhatsAppMessageWithAI(text, obrasList, partnersList);
      setParsedPreview(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedPreview) return;

    const newTx: Transaction = {
      id: `tx-wa-${Date.now()}`,
      type: parsedPreview.type || 'egreso',
      date: new Date().toISOString().slice(0, 10),
      amount: parsedPreview.amount || 0,
      currency: 'ARS',
      description: `[WhatsApp Bot] ${parsedPreview.description || sampleMessage}`,
      obraId: parsedPreview.obraId || 'general',
      category: parsedPreview.category || 'materiales',
      partnerId: parsedPreview.partnerId || null,
      paymentMethod: parsedPreview.paymentMethod || 'transferencia',
      receiptNumber: parsedPreview.receiptNumber || undefined,
      status: 'conciliado',
      notes: `Registrado automáticamente desde grupo de WhatsApp por Asistente Virtual. Mensaje original: "${sampleMessage}"`,
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      setParsedPreview(null);
    }, 2500);
  };

  const webhookEndpoint = `${window.location.origin}/api/whatsapp/webhook`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/60 p-6 rounded-2xl border border-emerald-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <MessageSquareCode className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Bot Asistente Virtual de WhatsApp para Grupos de Obra
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Permite a capataces, ingenieros y socios enviar audios o mensajes de texto a un grupo de WhatsApp. El motor IA interpreta y categoriza el gasto o ingreso automáticamente en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-emerald-500/30 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-emerald-300">Servicio Webhook Operativo</span>
        </div>
      </div>

      {/* Main Grid: Interactive Simulator + Architecture / Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulator Column */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Simulador de Mensajes de WhatsApp</h3>
            </div>
            <span className="text-[11px] text-slate-400">Grupo: &quot;Obras Construq Central&quot;</span>
          </div>

          {/* Quick presets */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Ejemplos de obra habituales (haz clic para probar):
            </div>
            <div className="space-y-1.5">
              {quickMessages.map((msg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSampleMessage(msg);
                    handleParseMessage(msg);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-slate-800/80 text-xs text-slate-300 transition truncate"
                >
                  💬 &quot;{msg}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Input text box */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-300">
              Escribe o pega un mensaje de texto de WhatsApp:
            </label>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={sampleMessage}
                onChange={(e) => setSampleMessage(e.target.value)}
                placeholder="Ej: Gasto 340000 alquiler de bomba de hormigon para Torre Aurora..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => handleParseMessage()}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Gemini IA Interpretando Mensaje...' : 'Interpretar y Extraer Datos con IA'}</span>
            </button>
          </div>

          {/* Parsed Result Card */}
          {parsedPreview && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Datos Extraídos con Éxito por Gemini</span>
                </span>
                <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {parsedPreview.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Monto Detectado:</div>
                  <div className="font-mono text-base font-black text-white">
                    ${parsedPreview.amount?.toLocaleString('es-AR')}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Concepto / Descripción:</div>
                  <div className="font-semibold text-slate-200">{parsedPreview.description}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Obra Imputada:</div>
                  <div className="font-bold text-blue-400">
                    {obras.find((o) => o.id === parsedPreview.obraId)?.name || '🏛️ Administración Central'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Categoría Asignada:</div>
                  <div className="font-bold text-amber-400 capitalize">
                    {parsedPreview.category?.replace(/_/g, ' ')}
                  </div>
                </div>

                {parsedPreview.partnerId && (
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Socio Imputado:</div>
                    <div className="font-bold text-purple-400">
                      {partners.find((p) => p.id === parsedPreview.partnerId)?.name}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Medio de Pago:</div>
                  <div className="font-mono text-slate-300 capitalize">{parsedPreview.paymentMethod}</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleConfirmAdd}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Confirmar e Incorporar a la Contabilidad</span>
                </button>
              </div>
            </div>
          )}

          {successToast && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>¡Transacción incorporada a la base de datos de Construq ERP!</span>
            </div>
          )}
        </div>

        {/* Configuration & Webhook Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Conexión de WhatsApp Cloud API</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Para habilitar la carga continua desde los grupos de WhatsApp de capataces de obra, vincule este endpoint con Meta WhatsApp Cloud API o Evolution API:
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Webhook Callback URL:</div>
              <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                <span className="font-mono text-xs text-emerald-400 truncate">{webhookEndpoint}</span>
                <button
                  onClick={handleCopyWebhook}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Copiar URL"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Token de Verificación:</div>
              <div className="font-mono text-xs text-white">CONSTRUQ_ERP_SECURE_TOKEN_2026</div>
            </div>

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Reglas de Seguridad y Cifrado:</div>
              <p>• Solo los números de teléfono autorizados (capataces y socios) pueden registrar movimientos.</p>
              <p>• Los mensajes pasan por sanitización y verificación de firma criptográfica SHA-256 de Meta.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
