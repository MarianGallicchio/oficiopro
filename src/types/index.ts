export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface FeatureFlags {
  maxAccounts: number; // 1 en gratis, ilimitadas en premium
  hasCustomCategories: boolean;
  hasCategoryBudgets: boolean;
  hasRecurringAutomation: boolean;
  hasAdvancedReports: boolean;
  hasExportCsvPdf: boolean;
  hasMultiCurrency: boolean;
  hasCloudBackup: boolean;
  hasCustomThemes: boolean;
  hasFreelanceModule: boolean; // Premium+ (clientes, presupuestos, facturas, horas)
  hasSavingsGoals: boolean;
}

export const TIER_FLAGS: Record<SubscriptionTier, FeatureFlags> = {
  free: {
    maxAccounts: 1,
    hasCustomCategories: false,
    hasCategoryBudgets: false,
    hasRecurringAutomation: false,
    hasAdvancedReports: false,
    hasExportCsvPdf: false,
    hasMultiCurrency: false,
    hasCloudBackup: false,
    hasCustomThemes: false,
    hasFreelanceModule: true, // Prototipo interactivo disponible
    hasSavingsGoals: true,
  },
  premium: {
    maxAccounts: 999,
    hasCustomCategories: true,
    hasCategoryBudgets: true,
    hasRecurringAutomation: true,
    hasAdvancedReports: true,
    hasExportCsvPdf: true,
    hasMultiCurrency: true,
    hasCloudBackup: true,
    hasCustomThemes: true,
    hasFreelanceModule: true,
    hasSavingsGoals: true,
  },
  premium_plus: {
    maxAccounts: 999,
    hasCustomCategories: true,
    hasCategoryBudgets: true,
    hasRecurringAutomation: true,
    hasAdvancedReports: true,
    hasExportCsvPdf: true,
    hasMultiCurrency: true,
    hasCloudBackup: true,
    hasCustomThemes: true,
    hasFreelanceModule: true,
    hasSavingsGoals: true,
  },
};

export type TransactionType = 'expense' | 'income';

export interface CurrencyConfig {
  code: string; // ej: ARS, USD, EUR, MXN, COP
  symbol: string; // ej: $, €, US$
  name: string;
  decimals: number; // 2 (100 centavos = 1 unidad)
}

export interface Account {
  id: string;
  name: string; // ej: "Billetera Principal", "Caja de Ahorro", "Mercado Pago"
  color: string;
  icon: string;
  isArchived: boolean;
  balanceInCents?: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isSystem: boolean;
  budgetAmountInCents?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  amountInCents: number; // SIEMPRE números enteros: $1500.50 -> 150050 centavos
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  reminderId?: string;
  savingsGoalId?: string; // Si es un ahorro voluntario
  clientId?: string; // Si proviene de cobro comercial
  invoiceId?: string;
}

export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Reminder {
  id: string;
  title: string;
  amountInCents: number;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  frequency: ReminderFrequency;
  categoryId: string;
  accountId: string;
  isPaid: boolean;
  paidAt?: string;
  notes?: string;
}

// GESTIÓN INDIVIDUAL DE AHORROS
export interface SavingsGoal {
  id: string;
  name: string; // ej: "Fondo de Emergencia", "Vacaciones", "Cambio de Celular"
  targetAmountInCents: number;
  currentAmountInCents: number;
  deadlineDate?: string;
  icon: string;
  color: string;
  isCompleted: boolean;
}

// USO COMERCIAL / FREELANCER (FASES SIGUIENTES)
export type ArgentineDocType = 'Factura C' | 'Factura B' | 'Factura A' | 'Remito X' | 'Recibo';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cuitCuil?: string;
  address?: string;
  notes?: string;
  balancePendingInCents: number; // Deuda pendiente de cobro
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceInCents: number;
  totalInCents: number;
}

export interface Quote {
  id: string;
  number: string; // ej: "P-0010"
  clientId: string;
  clientName: string;
  date: string;
  validDays: number;
  items: LineItem[];
  subtotalInCents: number;
  taxRatePercent: number; // Monotributo: 0, Resp. Inscripto: 21
  totalInCents: number;
  notes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'invoiced';
}

export interface Invoice {
  id: string;
  number: string; // ej: "0001-00000084"
  docType: ArgentineDocType;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  totalInCents: number;
  paidInCents: number;
  status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  quoteId?: string;
}

export interface TimeEntry {
  id: string;
  clientId: string;
  clientName: string;
  description: string;
  hourlyRateInCents: number;
  secondsLogged: number;
  date: string;
  isRunning: boolean;
  isInvoiced: boolean;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  cuit: string;
  ivaCondition: 'Monotributo' | 'Responsable Inscripto' | 'Consumidor Final' | 'Exento';
  aliasCbuMp: string;
  phone: string;
  email: string;
}

export type AppThemeId = 'minimal' | 'cyberpunk' | 'sakura' | 'golden';
export type AppDisplayMode = 'personal' | 'commercial';

export interface UserAppSettings {
  currency: CurrencyConfig;
  activeTier: SubscriptionTier;
  enableNotifications: boolean;
  dailyReminderTime: string;
  monthlyBudgetInCents: number;
  differentiatorMode: 'quick_entry' | 'daily_allowance' | 'zero_surprise_radar';
  theme: AppThemeId;
  activeMode: AppDisplayMode;
  businessProfile: BusinessProfile;
}
