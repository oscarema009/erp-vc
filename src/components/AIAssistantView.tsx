import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Send,
  RefreshCw,
  LineChart,
  Bot,
  User,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { Obra, Transaction, Partner, AIAuditResult, AIProjectionItem } from '../types';
import { fetchAiAudit, sendAiChatMessage, generateAiProjections } from '../services/geminiService';

interface AIAssistantViewProps {
  transactions: Transaction[];
  obras: Obra[];
  partners: Partner[];
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  transactions,
  obras,
  partners,
}) => {
  const [auditResult, setAuditResult] = useState<AIAuditResult | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Projections
  const [projections, setProjections] = useState<AIProjectionItem[]>([]);
  const [isLoadingProjections, setIsLoadingProjections] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy el Ing. Mateo Valenzuela, Director Financiero y Auditor IA de Construq. He analizado las finanzas de sus obras, las obligaciones impositivas y el pacto societario de Máximo (50%), Sergio (25%) y Mario (25%). ¿En qué puedo asistirlo hoy? Puede consultarme sobre optimización de costos, proyecciones de caja o impacto fiscal.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Prepare summary data for the AI
  const prepareContextData = () => {
    const totalIncomes = transactions
      .filter((t) => t.type === 'ingreso')
      .reduce((a, b) => a + b.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'egreso')
      .reduce((a, b) => a + b.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'egreso')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    const obrasSummary = obras.map((o) => {
      const oInc = transactions
        .filter((t) => t.obraId === o.id && t.type === 'ingreso')
        .reduce((a, b) => a + b.amount, 0);
      const oExp = transactions
        .filter((t) => t.obraId === o.id && t.type === 'egreso')
        .reduce((a, b) => a + b.amount, 0);
      return {
        code: o.code,
        name: o.name,
        budget: o.budgetTotal,
        incomes: oInc,
        expenses: oExp,
        margin: oInc - oExp,
        progress: o.progressPercentage,
      };
    });

    const partnerWithdrawals = partners.map((p) => {
      const drawings = transactions
        .filter((t) => t.partnerId === p.id && t.type === 'egreso')
        .reduce((a, b) => a + b.amount, 0);
      return {
        id: p.id,
        name: p.name,
        share: p.sharePercent,
        drawings,
      };
    });

    return {
      totalIncomes,
      totalExpenses,
      netProfit: totalIncomes - totalExpenses,
      categoryBreakdown,
      obrasSummary,
      partnerWithdrawals,
      partnerPact: 'Maximo 40% (50% nominal con 20% deducido para Gerencia), Sergio 25%, Mario 25%, Gerente General 10% de cuota',
    };
  };

  const handleRunAudit = async () => {
    setIsLoadingAudit(true);
    setAuditError(null);
    try {
      const context = prepareContextData();
      const res = await fetchAiAudit(context);
      setAuditResult(res);
    } catch (err: any) {
      setAuditError(err.message || 'Error al comunicarse con Gemini AI.');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleRunProjections = async () => {
    setIsLoadingProjections(true);
    try {
      const context = prepareContextData();
      const res = await generateAiProjections(context, 6);
      if (res && res.projections) {
        setProjections(res.projections);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProjections(false);
    }
  };

  useEffect(() => {
    // Run initial audit automatically if not yet loaded
    if (!auditResult && !isLoadingAudit) {
      handleRunAudit();
    }
  }, []);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMsg = chatInput.trim();
    const newHistory = [...chatMessages, { role: 'user' as const, content: userMsg }];
    setChatMessages(newHistory);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const context = prepareContextData();
      const reply = await sendAiChatMessage(newHistory, context);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Disculpe, ocurrió una demora en la conexión. Por favor reintente su consulta financiera.',
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/60 p-6 rounded-2xl border border-purple-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Motor IA & Asistente Financiero en Tiempo Real
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Impulsado por <strong>Google Gemini 3.8 Flash</strong>. Auditoría continua de cuentas, optimización impositiva, alertas de sobrecostos en obra y proyecciones de dividendos.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isLoadingAudit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingAudit ? 'animate-spin' : ''}`} />
          <span>{isLoadingAudit ? 'Auditando Cuentas...' : 'Actualizar Auditoría IA'}</span>
        </button>
      </div>

      {auditError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{auditError}</span>
          </div>
          <button
            onClick={handleRunAudit}
            className="px-3 py-1 rounded bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Audit Dashboard Section */}
      {auditResult && (
        <div className="space-y-6">
          {/* Health Score & Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Score Gauge */}
            <div className="md:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col items-center justify-center text-center">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Índice de Salud Financiera
              </div>
              <div className="relative w-32 h-32 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-purple-500"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - auditResult.financialHealthScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-mono text-white">
                    {auditResult.financialHealthScore}
                  </span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1 ${
                  auditResult.financialHealthScore >= 80
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                Estado: {auditResult.healthStatus}
              </span>
            </div>

            {/* Executive Summary */}
            <div className="md:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4" />
                <span>Dictamen del Auditor Financiero IA</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {auditResult.executiveSummary}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <strong className="text-purple-300">Análisis Cuenta Socios: </strong>
                {Array.isArray(auditResult.partnerAccountAnalysis)
                  ? auditResult.partnerAccountAnalysis.join(' ')
                  : auditResult.partnerAccountAnalysis}
              </div>
            </div>
          </div>

          {/* Tips: Tax Optimization & Cost Reduction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Optimization */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>Oportunidades de Optimización Impositiva y Contable</span>
              </div>
              <div className="space-y-2">
                {auditResult.taxOptimizationAdvice.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Reduction */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Lightbulb className="w-4 h-4" />
                <span>Alertas de Eficiencia y Reducción de Costos en Obra</span>
              </div>
              <div className="space-y-2">
                {auditResult.costReductionTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projections Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-400" />
              <span>Proyecciones Financieras Automatizadas (Próximos 6 Meses)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Cálculo automatizado de ingresos por certificación, flujo de caja y dividendo proyectado para Máximo, Sergio y Mario.
            </p>
          </div>

          <button
            onClick={handleRunProjections}
            disabled={isLoadingProjections}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProjections ? 'animate-spin' : ''}`} />
            <span>{isLoadingProjections ? 'Calculando...' : 'Generar Proyección Cuantitativa'}</span>
          </button>
        </div>

        {projections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Período</th>
                  <th className="p-2.5 text-right">Ingresos Proyectados</th>
                  <th className="p-2.5 text-right">Egresos Proyectados</th>
                  <th className="p-2.5 text-right">Utilidad Neta</th>
                  <th className="p-2.5 text-right text-amber-400">Máximo (40% Neto)</th>
                  <th className="p-2.5 text-right text-blue-400">Sergio (25%)</th>
                  <th className="p-2.5 text-right text-emerald-400">Mario (25%)</th>
                  <th className="p-2.5 text-right text-purple-400">Gerente (10% Cuota)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {projections.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-sans font-bold text-white whitespace-nowrap">{p.month}</td>
                    <td className="p-2.5 text-right text-emerald-400">${p.projectedIncome?.toLocaleString('es-AR')}</td>
                    <td className="p-2.5 text-right text-rose-400">${p.projectedExpenses?.toLocaleString('es-AR')}</td>
                    <td className="p-2.5 text-right font-bold text-white">${p.projectedNetProfit?.toLocaleString('es-AR')}</td>
                    <td className="p-2.5 text-right font-bold text-amber-400">${p.dividendsMaximo?.toLocaleString('es-AR')}</td>
                    <td className="p-2.5 text-right font-bold text-blue-400">${p.dividendsSergio?.toLocaleString('es-AR')}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-400">${p.dividendsMario?.toLocaleString('es-AR')}</td>
                    <td className="p-2.5 text-right font-bold text-purple-400">${(p.dividendsGerente || p.managerPerformanceFee)?.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80">
            <LineChart className="w-10 h-10 text-indigo-400/50 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-300">Proyección Trimestral Lista para Correr</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Haga clic en &quot;Generar Proyección Cuantitativa&quot; para estimar flujos de caja y utilidades futuras.
            </p>
            <button
              onClick={handleRunProjections}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              Iniciar Cálculo con Gemini AI
            </button>
          </div>
        )}
      </div>

      {/* Interactive AI CFO Chat */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Consultor & Auditor Contable IA</h3>
            <p className="text-xs text-slate-400">
              Conversación ejecutiva con Ing. Mateo Valenzuela (CFO Virtual)
            </p>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {chatMessages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isSendingChat && (
            <div className="flex gap-2 items-center text-xs text-purple-400 animate-pulse">
              <Bot className="w-4 h-4" />
              <span>Analizando base de datos y redactando respuesta contable...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendChat} className="flex gap-2 pt-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Pregúntele al auditor: ¿Cómo optimizar el IVA este mes? ¿Cuál es el margen de Torre Aurora?..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isSendingChat}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Consultar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
