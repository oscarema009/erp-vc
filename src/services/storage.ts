import { Obra, Transaction, InventoryItem, Partner, UserSession } from '../types';
import { INITIAL_OBRAS, INITIAL_TRANSACTIONS, INITIAL_INVENTORY, PARTNERS_CONFIG } from '../data/mockInitialData';

const KEYS = {
  OBRAS: 'construq_obras_v1',
  TRANSACTIONS: 'construq_transactions_v1',
  INVENTORY: 'construq_inventory_v1',
  PARTNERS: 'construq_partners_v1',
  SESSION: 'construq_session_v1',
  AUDIT_LOG: 'construq_audit_logs_v1',
};

export const getStoredObras = (): Obra[] => {
  try {
    const data = localStorage.getItem(KEYS.OBRAS);
    return data ? JSON.parse(data) : INITIAL_OBRAS;
  } catch (e) {
    return INITIAL_OBRAS;
  }
};

export const saveStoredObras = (obras: Obra[]): void => {
  localStorage.setItem(KEYS.OBRAS, JSON.stringify(obras));
};

export const getStoredTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (data) {
      const list: Transaction[] = JSON.parse(data);
      // Ensure sample transaction for gerente exists if none recorded yet
      if (!list.some((t) => t.partnerId === 'gerente')) {
        const gerenteTx = INITIAL_TRANSACTIONS.find((t) => t.id === 'tx-304');
        if (gerenteTx) {
          const merged = [...list, gerenteTx];
          localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(merged));
          return merged;
        }
      }
      return list;
    }
    return INITIAL_TRANSACTIONS;
  } catch (e) {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getStoredInventory = (): InventoryItem[] => {
  try {
    const data = localStorage.getItem(KEYS.INVENTORY);
    return data ? JSON.parse(data) : INITIAL_INVENTORY;
  } catch (e) {
    return INITIAL_INVENTORY;
  }
};

export const saveStoredInventory = (items: InventoryItem[]): void => {
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(items));
};

export const getStoredPartners = (): Partner[] => {
  try {
    const data = localStorage.getItem(KEYS.PARTNERS);
    if (data) {
      const parsed: Partner[] = JSON.parse(data);
      // If loaded from previous state without gerente, merge gerente partner
      if (Array.isArray(parsed) && !parsed.some((p) => p.id === 'gerente')) {
        const gerentePartner = PARTNERS_CONFIG.find((p) => p.id === 'gerente');
        if (gerentePartner) {
          const updated = [...parsed, gerentePartner];
          localStorage.setItem(KEYS.PARTNERS, JSON.stringify(updated));
          return updated;
        }
      }
      return parsed;
    }
    return PARTNERS_CONFIG;
  } catch (e) {
    return PARTNERS_CONFIG;
  }
};

export const saveStoredPartners = (partners: Partner[]): void => {
  localStorage.setItem(KEYS.PARTNERS, JSON.stringify(partners));
};

export const getStoredSession = (): UserSession => {
  try {
    const data = localStorage.getItem(KEYS.SESSION);
    if (data) return JSON.parse(data);
  } catch (e) {
    // fallback
  }
  return {
    isAuthenticated: true,
    email: 'admin@construq-erp.com',
    name: 'Ing. Carlos Mendoza',
    role: 'Socio Director',
    mfaVerified: true,
    mfaEnabled: true,
    mfaMethod: 'app_totp',
    lastLogin: new Date().toISOString(),
    encryptionActive: true,
  };
};

export const saveStoredSession = (session: UserSession): void => {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
};

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipHash: string;
}

export const getAuditLogs = (): AuditLogEntry[] => {
  try {
    const data = localStorage.getItem(KEYS.AUDIT_LOG);
    if (data) return JSON.parse(data);
  } catch (e) {
    // fallback
  }
  return [
    {
      id: 'log-001',
      timestamp: '2026-09-24T06:15:00Z',
      user: 'admin@construq-erp.com',
      action: 'LOGIN_MFA_SUCCESS',
      details: 'Inicio de sesión verificado con token TOTP 2FA cifrado.',
      ipHash: '190.220.***.42 (TLS 1.3 / AES-256)',
    },
    {
      id: 'log-002',
      timestamp: '2026-09-24T06:18:22Z',
      user: 'admin@construq-erp.com',
      action: 'DATA_SYNC',
      details: 'Sincronización instantánea de registros contables y stock en la nube.',
      ipHash: '190.220.***.42 (Encrypted Ledger)',
    },
  ];
};

export const addAuditLog = (action: string, details: string, user = 'admin@construq-erp.com') => {
  const logs = getAuditLogs();
  const newEntry: AuditLogEntry = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    details,
    ipHash: '190.220.***.42 (TLS 1.3 / AES-256-GCM)',
  };
  const updated = [newEntry, ...logs.slice(0, 49)];
  localStorage.setItem(KEYS.AUDIT_LOG, JSON.stringify(updated));
  return updated;
};

export const getInitialData = () => {
  return {
    obras: getStoredObras(),
    transactions: getStoredTransactions(),
    inventory: getStoredInventory(),
    partners: getStoredPartners(),
    session: getStoredSession(),
  };
};

export const saveTransactions = saveStoredTransactions;
export const saveObras = saveStoredObras;
export const saveInventory = saveStoredInventory;
export const savePartners = saveStoredPartners;
export const saveSession = saveStoredSession;
