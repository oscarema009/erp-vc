import { AIAuditResult, AIProjectionItem } from '../types';

export async function fetchAiAudit(summaryData: any): Promise<AIAuditResult> {
  const response = await fetch('/api/ai/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summaryData }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Error en servidor: ${response.status}`);
  }

  return response.json();
}

export async function sendAiChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: any
): Promise<string> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Error en servidor: ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}

export async function parseWhatsAppEntry(
  messageText: string,
  obrasList: Array<{ id: string; name?: string; code?: string }>,
  partnersList?: Array<{ id: string; name: string }>
): Promise<{
  type: 'egreso' | 'ingreso';
  amount: number;
  description: string;
  category: string;
  categoryLabel?: string;
  obraId: string;
  paymentMethod: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  partnerId?: 'maximo' | 'sergio' | 'mario' | 'gerente' | null;
  receiptNumber?: string;
  confidence: number;
  explanation: string;
}> {
  const response = await fetch('/api/ai/parse-whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageText, obrasList, partnersList }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Error en servidor: ${response.status}`);
  }

  return response.json();
}

export const parseWhatsAppMessageWithAI = parseWhatsAppEntry;

export async function generateAiProjections(
  historicalData: any,
  periodMonths = 6
): Promise<{
  projections: AIProjectionItem[];
  riskFactors: string[];
  strategicRecommendations: string[];
}> {
  const response = await fetch('/api/ai/projections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ historicalData, periodMonths }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Error en servidor: ${response.status}`);
  }

  return response.json();
}
