import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Transaction, Reminder, Category, Account, UserAppSettings,
  SavingsGoal, Client, Quote, Invoice, TimeEntry, AgendaEvent,
} from '../types';
import {
  INITIAL_SETTINGS, INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS,
  INITIAL_REMINDERS, INITIAL_SAVINGS_GOALS, INITIAL_CLIENTS, INITIAL_QUOTES,
  INITIAL_INVOICES, INITIAL_TIME_ENTRIES, INITIAL_AGENDA_EVENTS,
} from '../data/mockData';

export interface AppDatabase {
  settings: UserAppSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  reminders: Reminder[];
  savingsGoals: SavingsGoal[];
  clients: Client[];
  quotes: Quote[];
  invoices: Invoice[];
  timeEntries: TimeEntry[];
  agendaEvents: AgendaEvent[];
}

const INITIAL_DB: Omit<AppDatabase, 'agendaEvents'> & { agendaEvents?: AgendaEvent[] } = {
  settings: INITIAL_SETTINGS,
  accounts: INITIAL_ACCOUNTS,
  categories: INITIAL_CATEGORIES,
  transactions: INITIAL_TRANSACTIONS,
  reminders: INITIAL_REMINDERS,
  savingsGoals: INITIAL_SAVINGS_GOALS,
  clients: INITIAL_CLIENTS,
  quotes: INITIAL_QUOTES,
  invoices: INITIAL_INVOICES,
  timeEntries: INITIAL_TIME_ENTRIES,
};

const COLLECTIONS: Array<{ key: keyof AppDatabase; legacyPrefix: string }> = [
  { key: 'settings',       legacyPrefix: 'op_fin_settings_v2' },
  { key: 'accounts',       legacyPrefix: 'op_fin_accounts_v2' },
  { key: 'categories',     legacyPrefix: 'op_fin_categories_v2' },
  { key: 'transactions',   legacyPrefix: 'op_fin_transactions_v2' },
  { key: 'reminders',      legacyPrefix: 'op_fin_reminders_v2' },
  { key: 'savingsGoals',   legacyPrefix: 'op_fin_savings_goals' },
  { key: 'clients',        legacyPrefix: 'op_fin_clients' },
  { key: 'quotes',         legacyPrefix: 'op_fin_quotes' },
  { key: 'invoices',       legacyPrefix: 'op_fin_invoices' },
  { key: 'timeEntries',    legacyPrefix: 'op_fin_time_entries' },
  { key: 'agendaEvents',   legacyPrefix: 'op_fin_agenda_events' },
];

const LEGACY_DATA_KEY = 'op_fin_db_v1';

/** Carga la base de datos del usuario (con migración automática de datos antiguos). */
function loadDb(uid: string): AppDatabase {
  const stored = localStorage.getItem(LEGACY_DATA_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as AppDatabase;
      const defaults = settingsDefaults(uid);
      return normalize(parsed, defaults);
    } catch { /* sigue */ }
  }

  const defaults = settingsDefaults(uid);
  const db: AppDatabase = { ...(INITIAL_DB as AppDatabase), agendaEvents: INITIAL_AGENDA_EVENTS, settings: defaults };
  return db;
}

function settingsDefaults(uid: string): UserAppSettings {
  // Copia inicial por usuario: usa los datos muestra una sola vez
  return { ...INITIAL_SETTINGS };
}

/** Valida y completa campos faltantes al cargar. */
function normalize(raw: Partial<AppDatabase>, defaults: UserAppSettings): AppDatabase {
  return {
    settings: { ...defaults, ...(raw.settings || {}) },
    accounts: raw.accounts || INITIAL_ACCOUNTS,
    categories: raw.categories || INITIAL_CATEGORIES,
    transactions: raw.transactions || INITIAL_TRANSACTIONS,
    reminders: raw.reminders || INITIAL_REMINDERS,
    savingsGoals: raw.savingsGoals || INITIAL_SAVINGS_GOALS,
    clients: raw.clients || INITIAL_CLIENTS,
    quotes: raw.quotes || INITIAL_QUOTES,
    invoices: raw.invoices || INITIAL_INVOICES,
    timeEntries: raw.timeEntries || INITIAL_TIME_ENTRIES,
    agendaEvents: raw.agendaEvents || INITIAL_AGENDA_EVENTS,
  };
}

/**
 * Hook central de datos: carga y persiste por usuario (uid) la base completa.
 * Migración: si existían claves op_fin_* sueltas, se consolidan en la nueva Base única.
 */
export function useAppData(user: { uid: string; provider: string } | null) {
  const storageKey = 'op_fin_db_v1';
  const [db, setDb] = useState<AppDatabase | null>(null);
  const loadedUidRef = useRef<string | null>(null);

  // Carga inicial / cambio de usuario
  useEffect(() => {
    if (!user) {
      setDb(null);
      loadedUidRef.current = null;
      return;
    }
    if (loadedUidRef.current === user.uid) return;
    loadedUidRef.current = user.uid;

    // Si estaba todo suelto en claves antiguas, migro una vez
    if (!localStorage.getItem(storageKey)) {
      const migrated: Partial<AppDatabase> = {};
      let hadAny = false;
      for (const { key, legacyPrefix } of COLLECTIONS) {
        const raw = localStorage.getItem(legacyPrefix);
        if (raw) {
          try {
            (migrated as Record<string, unknown>)[key] = JSON.parse(raw);
            hadAny = true;
          } catch { /* ignora */ }
        }
      }
      if (hadAny) {
        const norm = normalize(migrated, INITIAL_SETTINGS);
        localStorage.setItem(storageKey, JSON.stringify(norm));
      }
    }

    setDb(loadDb(user.uid));
  }, [user]);

  // Persistencia con debounce
  useEffect(() => {
    if (!db || !user) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(db));
      } catch (e) {
        console.error('No se pudo guardar los datos:', e);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [db, user]);

  // ----- Acciones -----
  const updateSettings = useCallback((patch: Partial<UserAppSettings>) => {
    setDb((prev) => prev ? { ...prev, settings: { ...prev.settings, ...patch } } : prev);
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    setDb((prev) => prev ? {
      ...prev,
      transactions: [{ ...tx, id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }, ...prev.transactions],
    } : prev);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setDb((prev) => prev ? { ...prev, transactions: prev.transactions.filter((t) => t.id !== id) } : prev);
  }, []);

  const payReminder = useCallback((reminderId: string) => {
    setDb((prev) => {
      if (!prev) return prev;
      const target = prev.reminders.find((r) => r.id === reminderId);
      if (!target) return prev;
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'expense',
        accountId: target.accountId,
        categoryId: target.categoryId,
        amountInCents: target.amountInCents,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        note: `Pago de recordatorio: ${target.title}`,
        reminderId: target.id,
      };
      return {
        ...prev,
        reminders: prev.reminders.map((r) => r.id === reminderId ? { ...r, isPaid: true, paidAt: new Date().toISOString() } : r),
        transactions: [newTx, ...prev.transactions],
      };
    });
  }, []);

  const addReminder = useCallback((reminder: Omit<Reminder, 'id'>) => {
    setDb((prev) => prev ? {
      ...prev,
      reminders: [...prev.reminders, { ...reminder, id: `rem-${Date.now()}` }],
    } : prev);
  }, []);

  const updateReminder = useCallback((id: string, patch: Partial<Reminder>) => {
    setDb((prev) => prev ? {
      ...prev,
      reminders: prev.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    } : prev);
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setDb((prev) => prev ? { ...prev, reminders: prev.reminders.filter((r) => r.id !== id) } : prev);
  }, []);

  const addSavingsDeposit = useCallback((goalId: string, amountInCents: number) => {
    setDb((prev) => {
      if (!prev) return prev;
      const goal = prev.savingsGoals.find((g) => g.id === goalId);
      if (!goal) return prev;
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'expense',
        accountId: prev.accounts[0]?.id || 'acc-1',
        categoryId: 'cat-savings',
        amountInCents,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        note: `Aporte a meta: ${goal.name}`,
        savingsGoalId: goalId,
      };
      return {
        ...prev,
        savingsGoals: prev.savingsGoals.map((g) => g.id === goalId
          ? { ...g, currentAmountInCents: g.currentAmountInCents + amountInCents, isCompleted: g.currentAmountInCents + amountInCents >= g.targetAmountInCents }
          : g),
        transactions: [newTx, ...prev.transactions],
      };
    });
  }, []);

  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id'>) => {
    setDb((prev) => prev ? {
      ...prev,
      savingsGoals: [...prev.savingsGoals, { ...goal, id: `goal-${Date.now()}` }],
    } : prev);
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setDb((prev) => prev ? { ...prev, savingsGoals: prev.savingsGoals.filter((g) => g.id !== id) } : prev);
  }, []);

  const addClient = useCallback((client: Omit<Client, 'id' | 'balancePendingInCents'>) => {
    setDb((prev) => prev ? {
      ...prev,
      clients: [...prev.clients, { ...client, id: `cli-${Date.now()}`, balancePendingInCents: 0 }],
    } : prev);
  }, []);

  const deleteClient = useCallback((id: string) => {
    setDb((prev) => prev ? { ...prev, clients: prev.clients.filter((c) => c.id !== id) } : prev);
  }, []);

  const addQuote = useCallback((quote: Omit<Quote, 'id'>) => {
    setDb((prev) => prev ? {
      ...prev,
      quotes: [{ ...quote, id: `q-${Date.now()}` }, ...prev.quotes],
    } : prev);
  }, []);

  const convertQuoteToInvoice = useCallback((quoteId: string) => {
    setDb((prev) => {
      if (!prev) return prev;
      const quote = prev.quotes.find((q) => q.id === quoteId);
      if (!quote) return prev;
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        number: `0001-${String(prev.invoices.length + 45).padStart(8, '0')}`,
        docType: 'Factura C',
        clientId: quote.clientId,
        clientName: quote.clientName,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        items: quote.items,
        totalInCents: quote.totalInCents,
        paidInCents: 0,
        status: 'unpaid',
        quoteId: quote.id,
        notes: 'Generada a partir de presupuesto aprobado.',
      };
      return {
        ...prev,
        quotes: prev.quotes.map((q) => (q.id === quoteId ? { ...q, status: 'invoiced' as const } : q)),
        invoices: [newInvoice, ...prev.invoices],
        clients: prev.clients.map((c) => c.id === quote.clientId
          ? { ...c, balancePendingInCents: c.balancePendingInCents + quote.totalInCents } : c),
      };
    });
  }, []);

  const registerInvoicePayment = useCallback((invoiceId: string, amountInCents: number) => {
    setDb((prev) => {
      if (!prev) return prev;
      const invoice = prev.invoices.find((i) => i.id === invoiceId);
      if (!invoice) return prev;
      const newPaid = Math.min(invoice.totalInCents, invoice.paidInCents + amountInCents);
      const isNowPaid = newPaid >= invoice.totalInCents;
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'income',
        accountId: prev.accounts[0]?.id || 'acc-1',
        categoryId: 'cat-sales',
        amountInCents,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        note: `Cobro ${invoice.docType} N° ${invoice.number} (${invoice.clientName})`,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
      };
      return {
        ...prev,
        invoices: prev.invoices.map((inv) => inv.id === invoiceId
          ? { ...inv, paidInCents: newPaid, status: (isNowPaid ? 'paid' : 'partial') as Invoice['status'] } : inv),
        clients: prev.clients.map((c) => c.id === invoice.clientId
          ? { ...c, balancePendingInCents: Math.max(0, c.balancePendingInCents - amountInCents) } : c),
        transactions: [newTx, ...prev.transactions],
      };
    });
  }, []);

  const toggleTimer = useCallback((entryId: string) => {
    setDb((prev) => prev ? {
      ...prev,
      timeEntries: prev.timeEntries.map((e) => e.id === entryId ? { ...e, isRunning: !e.isRunning } : e),
    } : prev);
  }, []);

  const billTimeEntry = useCallback((entryId: string) => {
    setDb((prev) => {
      if (!prev) return prev;
      const entry = prev.timeEntries.find((t) => t.id === entryId);
      if (!entry) return prev;
      const totalCents = Math.round((entry.secondsLogged / 3600) * entry.hourlyRateInCents);
      const newQuote: Quote = {
        id: `q-${Date.now()}`,
        number: `P-${String(prev.quotes.length + 12).padStart(4, '0')}`,
        clientId: entry.clientId,
        clientName: entry.clientName,
        date: new Date().toISOString().split('T')[0],
        validDays: 10,
        items: [{
          id: `qi-${Date.now()}`,
          description: `${entry.description} (${(entry.secondsLogged / 3600).toFixed(1)} horas)`,
          quantity: 1,
          unitPriceInCents: totalCents,
          totalInCents: totalCents,
        }],
        subtotalInCents: totalCents,
        taxRatePercent: 0,
        totalInCents: totalCents,
        notes: 'Presupuesto emitido a partir de horas de trabajo acumuladas.',
        status: 'approved',
      };
      return {
        ...prev,
        quotes: [newQuote, ...prev.quotes],
        timeEntries: prev.timeEntries.map((t) => t.id === entryId ? { ...t, isInvoiced: true, isRunning: false } : t),
      };
    });
  }, []);

  const addAgendaEvent = useCallback((event: Omit<AgendaEvent, 'id'>) => {
    setDb((prev) => prev ? {
      ...prev,
      agendaEvents: [...prev.agendaEvents, { ...event, id: `evt-${Date.now()}` }],
    } : prev);
  }, []);

  const updateAgendaEvent = useCallback((id: string, patch: Partial<AgendaEvent>) => {
    setDb((prev) => prev ? {
      ...prev,
      agendaEvents: prev.agendaEvents.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    } : prev);
  }, []);

  const deleteAgendaEvent = useCallback((id: string) => {
    setDb((prev) => prev ? { ...prev, agendaEvents: prev.agendaEvents.filter((e) => e.id !== id) } : prev);
  }, []);

  /** Lleva la cuenta atrás de cronómetros en vivo (por segundo). */
  useEffect(() => {
    if (!db?.timeEntries.some((t) => t.isRunning)) return;
    const iv = setInterval(() => {
      setDb((prev) => prev ? {
        ...prev,
        timeEntries: prev.timeEntries.map((t) => t.isRunning
          ? { ...t, secondsLogged: t.secondsLogged + 1 }
          : t),
      } : prev);
    }, 1000);
    return () => clearInterval(iv);
  }, [db?.timeEntries]);

  /** Exporta un backup JSON completo. */
  const exportBackup = useCallback(() => {
    if (!db) return;
    const blob = new Blob([JSON.stringify({ ...db, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_oficiopro_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [db]);

  return {
    db,
    updateSettings,
    addTransaction,
    deleteTransaction,
    payReminder,
    addReminder,
    updateReminder,
    deleteReminder,
    addSavingsDeposit,
    addSavingsGoal,
    deleteSavingsGoal,
    addClient,
    deleteClient,
    addQuote,
    convertQuoteToInvoice,
    registerInvoicePayment,
    toggleTimer,
    billTimeEntry,
    addAgendaEvent,
    updateAgendaEvent,
    deleteAgendaEvent,
    exportBackup,
  };
}
