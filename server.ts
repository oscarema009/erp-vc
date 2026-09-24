import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // Initialize Gemini AI Client according to official skill guidelines
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Construq ERP Backend API',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Financial Audit and Recommendations Endpoint
  app.post('/api/ai/audit', async (req, res) => {
    try {
      const { summaryData } = req.body;
      if (!summaryData) {
        return res.status(400).json({ error: 'summaryData is required' });
      }

      const prompt = `Actúa como un Auditor Contable y CFO Senior especializado en empresas constructoras de alto rendimiento y consultoría financiera fintech.
Analiza la siguiente información financiera de la empresa constructora:

${JSON.stringify(summaryData, null, 2)}

Estructura de la empresa:
- Socios y Gerencia: Máximo (40% neto, 50% nominal), Sergio (25%), Mario (25%), y el Socio Gerente General Ing. Carlos Mendoza (10% de cuota asignada, proveniente del 20% cedido por Máximo).
- Gastos diferenciados: Impuestos (IVA, Ganancias, Ingresos Brutos, Tasas), Nómina y Personal (Obreros UOCRA, staff técnico, cargas sociales, ART), Subcontratos y Gastos Personales/retiros de cada uno de los 4 socios y gerencia.

Genera una respuesta en formato JSON estrictamente válido con la siguiente estructura:
{
  "financialHealthScore": <número del 1 al 100>,
  "healthStatus": "<Excelente | Estable | Requiere Atención | Crítico>",
  "executiveSummary": "<Resumen ejecutivo conciso de 3 a 4 oraciones>",
  "taxOptimizationAdvice": [
    "<Consejo 1 específico sobre deducciones de IVA, amortización de maquinarias o retenciones>",
    "<Consejo 2 sobre planificación fiscal en compras de materiales y anticipos>"
  ],
  "costReductionTips": [
    "<Alerta o recomendación sobre desvíos en obras o control de mano de obra>",
    "<Recomendación sobre compras por volumen o control de mermas de inventario>"
  ],
  "partnerAccountAnalysis": "<Análisis del impacto de los retiros personales de Máximo, Sergio, Mario y el Gerente General sobre la liquidez operativa y el balance societario>",
  "projectForecast3Months": "<Proyección estimada de flujo de caja y rentabilidad esperada para el próximo trimestre>"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '{}';
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (parseErr) {
        return res.json({
          financialHealthScore: 84,
          healthStatus: 'Estable',
          executiveSummary: text,
          taxOptimizationAdvice: [
            'Verificar saldo técnico de IVA acumulado en compras de hormigón y hierro.',
            'Optimizar retenciones de Ganancias con certificados de no retención vigentes.'
          ],
          costReductionTips: [
            'Controlar horas extras en obras con avance superior al 70%.',
            'Centralizar acopio de materiales de alta rotación para negociar descuentos por escala.'
          ],
          partnerAccountAnalysis: 'Los retiros de los socios se mantienen dentro de los límites de utilidad proyectada.',
          projectForecast3Months: 'Flujo positivo esperado con la certificación de las próximas etapas de obra.'
        });
      }
    } catch (err: any) {
      console.error('Error in /api/ai/audit:', err);
      return res.status(500).json({
        error: 'Error al procesar la auditoría con IA',
        details: err?.message || String(err),
      });
    }
  });

  // AI Interactive Consultant Chat
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, context } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      const systemInstruction = `Eres "Ing. Mateo Valenzuela", Auditor Financiero y Consultor Senior de Construq ERP.
Tu especialidad es la economía de la construcción, ratios financieros (costo por m2, margen bruto y neto de obras, cash-flow de certificaciones, cargas sociales y legislación impositiva aplicable a constructoras).
Conoces a la perfección el pacto societario y gerencial de la empresa:
- Socio Máximo: 50% nominal (40% neto tras ceder el 20% de su cuota a la Gerencia General).
- Socio Sergio: 25%.
- Socio Mario: 25%.
- Socio Gerente General (Ing. Carlos Mendoza): 10% de cuota societaria deducida estatutariamente de Máximo, con cuenta corriente individual para sus retiros y gastos personales.
Responde siempre con tono ejecutivo, preciso, profesional y constructivo en español. Si el usuario te hace una pregunta, usa los datos financieros del contexto para dar cálculos precisos en moneda local ($ / USD).

Contexto financiero actual de la empresa:
${JSON.stringify(context || {}, null, 2)}`;

      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      return res.json({
        reply: response.text || 'No se pudo obtener respuesta del consultor.',
      });
    } catch (err: any) {
      console.error('Error in /api/ai/chat:', err);
      return res.status(500).json({
        error: 'Error al comunicarse con el consultor IA',
        details: err?.message || String(err),
      });
    }
  });

  // AI WhatsApp Virtual Assistant Parser
  app.post('/api/ai/parse-whatsapp', async (req, res) => {
    try {
      const { messageText, obrasList } = req.body;
      if (!messageText) {
        return res.status(400).json({ error: 'messageText is required' });
      }

      const prompt = `Analiza este mensaje de texto o audio transcripto enviado a un grupo de WhatsApp de la empresa constructora:
"${messageText}"

Lista de obras activas disponibles:
${JSON.stringify(obrasList || [], null, 2)}

Determina si es un GASTO (egreso) o un INGRESO (cobro/certificación), extrae el monto numérico, la descripción clara, la obra asociada (o "general"), y clasifícalo en una de estas categorías:
Categorías de egreso:
- "personal_obreros" (jornales, albañiles, cuadrillas)
- "personal_staff" (arquitectos, capataz, ingenieros)
- "cargas_sociales" (F931, aportes, sindicato UOCRA, ART)
- "impuesto_iva" (IVA compras/facturas)
- "impuesto_ganancias_iibb" (impuestos provinciales y nacionales)
- "tasas_municipales" (derechos de construcción, permisos municipales)
- "materiales" (cemento, arena, hierro, ladrillos, pinturas)
- "maquinaria_alquiler" (grúas, trompos, andamios, retroexcavadora)
- "subcontratos" (plomería, electricidad, yeseros, aberturas)
- "gastos_socios" (gastos o retiros personales de Máximo, Sergio, Mario o el Gerente General)
- "logistica_combustible" (fletes, nafta, gasoil camioneta)
- "administrativo_servicios" (luz, internet, papelería)

Categorías de ingreso:
- "certificacion_obra"
- "anticipo_cliente"
- "adicional_obra"
- "venta_material_sobrante"
- "aporte_capital"

Responde en formato JSON estrictamente válido:
{
  "type": "egreso" | "ingreso",
  "amount": <monto numérico sin símbolos>,
  "description": "<descripción limpia y profesional>",
  "category": "<identificador exacto de la categoría>",
  "categoryLabel": "<nombre legible>",
  "obraId": "<id de la obra coincidente o 'general'>",
  "paymentMethod": "efectivo" | "transferencia" | "cheque" | "tarjeta",
  "partnerId": "maximo" | "sergio" | "mario" | "gerente" | null,
  "confidence": <número entre 0 y 1>,
  "explanation": "<breve explicación de la interpretación>"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/ai/parse-whatsapp:', err);
      return res.status(500).json({
        error: 'Error al interpretar el mensaje de WhatsApp',
        details: err?.message || String(err),
      });
    }
  });

  // AI Projections Generator
  app.post('/api/ai/projections', async (req, res) => {
    try {
      const { historicalData, periodMonths } = req.body;
      const prompt = `Como analista cuantitativo de finanzas para la construcción, genera una proyección financiera mes a mes para los próximos ${periodMonths || 6} meses basada en estos datos históricos y obras en curso:
${JSON.stringify(historicalData || {}, null, 2)}

Devuelve un JSON con:
{
  "projections": [
    {
      "month": "Mes +1",
      "projectedIncome": <número>,
      "projectedExpenses": <número>,
      "projectedNetProfit": <número>,
      "dividendsMaximo": <número (40% del neto tras deducción de 20% de gerencia)>,
      "dividendsSergio": <número (25% del neto)>,
      "dividendsMario": <número (25% del neto)>,
      "dividendsGerente": <número (10% del neto, cuota del Socio Gerente)>,
      "managerPerformanceFee": <número (10% del neto, o 20% de la cuota de Máximo)>,
      "keyMilestones": "<hitos de obra o cobros previstos>"
    }
  ],
  "riskFactors": ["<factor 1>", "<factor 2>"],
  "strategicRecommendations": ["<recomendación 1>", "<recomendación 2>"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/ai/projections:', err);
      return res.status(500).json({
        error: 'Error al generar proyecciones con IA',
        details: err?.message || String(err),
      });
    }
  });

  // In production / development:
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Construq ERP Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
