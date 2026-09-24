export type TransactionType = 'ingreso' | 'egreso';

export type ExpenseCategory =
  | 'personal_obreros'
  | 'personal_staff'
  | 'cargas_sociales'
  | 'impuesto_iva'
  | 'impuesto_ganancias_iibb'
  | 'tasas_municipales'
  | 'materiales'
  | 'maquinaria_alquiler'
  | 'subcontratos'
  | 'gastos_socios'
  | 'logistica_combustible'
  | 'administrativo_servicios';

export type IncomeCategory =
  | 'certificacion_obra'
  | 'anticipo_cliente'
  | 'adicional_obra'
  | 'venta_material_sobrante'
  | 'aporte_capital';

export type CategoryId = ExpenseCategory | IncomeCategory;

export type PartnerId = 'maximo' | 'sergio' | 'mario' | 'gerente';

export interface Partner {
  id: PartnerId;
  name: string;
  sharePercent: number; // Maximo: 50 (nominal), Sergio: 25, Mario: 25, Gerente: 10 (20% de Maximo)
  role: string;
  email: string;
  managerFeeDeductionPercent: number; // 20% for Maximo, 0 for others
  avatarBg: string;
}

export interface Obra {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  status: 'en_ejecucion' | 'planificacion' | 'finalizada' | 'pausada';
  startDate: string;
  estimatedEndDate: string;
  budgetTotal: number;
  progressPercentage: number;
  squareMeters: number;
  leadEngineer: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  amount: number;
  currency: 'ARS' | 'USD';
  description: string;
  obraId: string; // obra id or 'general'
  category: CategoryId;
  subCategory?: string;
  partnerId?: PartnerId | null; // Set when category is 'gastos_socios' or partner personal drawing
  taxDetail?: {
    hasIva: boolean;
    ivaRate: number; // e.g. 21, 10.5
    netAmount?: number;
    ivaAmount?: number;
  };
  paymentMethod: 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta';
  receiptNumber?: string;
  status: 'conciliado' | 'pendiente' | 'observado';
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category:
    | 'material_grueso'
    | 'hierro_acero'
    | 'acabados'
    | 'herramientas'
    | 'epp_seguridad'
    | 'quimicos_aditivos';
  unit: 'bolsas' | 'toneladas' | 'kg' | 'm2' | 'm3' | 'unidades' | 'barras' | 'metros';
  currentStock: number;
  minStockAlert: number;
  unitCost: number;
  assignedLocation: string; // 'almacen_central' or obraId
  lastRestockDate: string;
  supplier: string;
}

export interface AIAuditResult {
  financialHealthScore: number;
  healthStatus: 'Excelente' | 'Estable' | 'Requiere Atención' | 'Crítico';
  executiveSummary: string;
  taxOptimizationAdvice: string[];
  costReductionTips: string[];
  partnerAccountAnalysis: string[];
  projectForecast3Months: string;
}

export interface AIProjectionItem {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedNetProfit: number;
  dividendsMaximo: number;
  dividendsSergio: number;
  dividendsMario: number;
  dividendsGerente: number;
  managerPerformanceFee: number;
  keyMilestones: string;
}

export interface UserSession {
  isAuthenticated: boolean;
  email: string;
  name: string;
  role: 'Socio Director' | 'Auditor Contable' | 'Jefe de Obra' | 'Gerente General';
  mfaVerified: boolean;
  mfaEnabled: boolean;
  mfaMethod: 'app_totp' | 'sms_otp';
  lastLogin: string;
  encryptionActive: boolean;
}
