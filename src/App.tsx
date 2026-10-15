import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  FolderTree, 
  Code2, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle2, 
  HelpCircle,
  Layers,
  PiggyBank,
  Briefcase
} from 'lucide-react';
import { 
  Transaction, 
  Reminder, 
  Category, 
  Account, 
  UserAppSettings, 
  SavingsGoal, 
  Client, 
  Quote, 
  Invoice, 
  TimeEntry 
} from './types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_ACCOUNTS, 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_REMINDERS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_CLIENTS,
  INITIAL_QUOTES,
  INITIAL_INVOICES,
  INITIAL_TIME_ENTRIES
} from './data/mockData';
import { MobileSimulator } from './components/MobileSimulator';
import { Phase0Doc } from './components/Phase0Doc';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { NavigationFlowDiagram } from './components/NavigationFlowDiagram';
import { UserHelpModal } from './components/UserHelpModal';

export default function App() {
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<'simulator' | 'phase0' | 'flow' | 'code'>('simulator');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const [settings, setSettings] = useState<UserAppSettings>(() => {
    const saved = localStorage.getItem('op_fin_settings_v2');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('op_fin_accounts_v2');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('op_fin_categories_v2');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('op_fin_transactions_v2');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('op_fin_reminders_v2');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('op_fin_savings_goals');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('op_fin_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('op_fin_quotes');
    return saved ? JSON.parse(saved) : INITIAL_QUOTES;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('op_fin_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('op_fin_time_entries');
    return saved ? JSON.parse(saved) : INITIAL_TIME_ENTRIES;
  });

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('op_fin_settings_v2', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('op_fin_accounts_v2', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('op_fin_categories_v2', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('op_fin_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('op_fin_reminders_v2', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('op_fin_savings_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('op_fin_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('op_fin_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('op_fin_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('op_fin_time_entries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  // Handlers
  const handleAddTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handlePayReminder = (reminderId: string) => {
    const targetRem = reminders.find((r) => r.id === reminderId);
    if (!targetRem) return;

    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminderId
          ? { ...r, isPaid: true, paidAt: new Date().toISOString() }
          : r
      )
    );

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'expense',
      accountId: targetRem.accountId,
      categoryId: targetRem.categoryId,
      amountInCents: targetRem.amountInCents,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      note: `Pago de recordatorio: ${targetRem.title}`,
      reminderId: targetRem.id,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleAddSavingsDeposit = (goalId: string, amountInCents: number) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    // Increase goal current amount
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmountInCents: g.currentAmountInCents + amountInCents,
              isCompleted: g.currentAmountInCents + amountInCents >= g.targetAmountInCents,
            }
          : g
      )
    );

    // Create financial transaction record
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'expense',
      accountId: accounts[0].id,
      categoryId: 'cat-savings',
      amountInCents,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      note: `Aporte a meta: ${goal.name}`,
      savingsGoalId: goalId,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleAddClient = (clientData: Omit<Client, 'id' | 'balancePendingInCents'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      balancePendingInCents: 0,
    };
    setClients((prev) => [...prev, newClient]);
  };

  const handleAddQuote = (quoteData: Omit<Quote, 'id'>) => {
    const newQuote: Quote = {
      ...quoteData,
      id: `q-${Date.now()}`,
    };
    setQuotes((prev) => [newQuote, ...prev]);
  };

  const handleConvertQuoteToInvoice = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    // Mark quote as invoiced
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: 'invoiced' } : q))
    );

    // Create Invoice
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: `0001-${String(invoices.length + 45).padStart(8, '0')}`,
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

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update client pending balance
    setClients((prev) =>
      prev.map((c) =>
        c.id === quote.clientId
          ? { ...c, balancePendingInCents: c.balancePendingInCents + quote.totalInCents }
          : c
      )
    );
  };

  const handleRegisterInvoicePayment = (invoiceId: string, amountInCents: number) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const newPaid = Math.min(invoice.totalInCents, invoice.paidInCents + amountInCents);
    const isNowPaid = newPaid >= invoice.totalInCents;

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              paidInCents: newPaid,
              status: isNowPaid ? 'paid' : 'partial',
            }
          : inv
      )
    );

    // Reduce client pending balance
    setClients((prev) =>
      prev.map((c) =>
        c.id === invoice.clientId
          ? { ...c, balancePendingInCents: Math.max(0, c.balancePendingInCents - amountInCents) }
          : c
      )
    );

    // Record income transaction in integer cents
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'income',
      accountId: accounts[0].id,
      categoryId: 'cat-sales',
      amountInCents,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      note: `Cobro ${invoice.docType} N° ${invoice.number} (${invoice.clientName})`,
      clientId: invoice.clientId,
      invoiceId: invoice.id,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleToggleTimer = (entryId: string) => {
    setTimeEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === entryId) {
          return { ...entry, isRunning: !entry.isRunning };
        }
        return entry;
      })
    );
  };

  const handleBillTimeEntry = (entryId: string) => {
    const entry = timeEntries.find((t) => t.id === entryId);
    if (!entry) return;

    const totalCents = Math.round((entry.secondsLogged / 3600) * entry.hourlyRateInCents);

    // Create quote from hours
    const newQuote: Quote = {
      id: `q-${Date.now()}`,
      number: `P-${String(quotes.length + 12).padStart(4, '0')}`,
      clientId: entry.clientId,
      clientName: entry.clientName,
      date: new Date().toISOString().split('T')[0],
      validDays: 10,
      items: [
        {
          id: `qi-${Date.now()}`,
          description: `${entry.description} (${(entry.secondsLogged / 3600).toFixed(1)} horas)`,
          quantity: 1,
          unitPriceInCents: totalCents,
          totalInCents: totalCents,
        },
      ],
      subtotalInCents: totalCents,
      taxRatePercent: 0,
      totalInCents: totalCents,
      notes: 'Presupuesto emitido a partir de horas de trabajo acumuladas.',
      status: 'approved',
    };

    setQuotes((prev) => [newQuote, ...prev]);
    setTimeEntries((prev) =>
      prev.map((t) => (t.id === entryId ? { ...t, isInvoiced: true, isRunning: false } : t))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* Studio Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-sky-500/20">
              $
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">Finanzas & Oficio</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  HUD Dual: Personal + Comercial
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Ahorros, Ingresos, Gastos (&lt;10s), Clientes, Presupuestos, Cobros con Alias y Ayuda Completa
              </p>
            </div>
          </div>

          {/* Workbench Tabs & Help Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold text-xs hover:bg-sky-100 transition shadow-xs"
            >
              <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Ayuda Completa</span>
            </button>

            <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveWorkbenchTab('simulator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeWorkbenchTab === 'simulator'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Simulador HUD</span>
              </button>

              <button
                onClick={() => setActiveWorkbenchTab('flow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeWorkbenchTab === 'flow'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Flujo UX Minimalista</span>
              </button>

              <button
                onClick={() => setActiveWorkbenchTab('phase0')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeWorkbenchTab === 'phase0'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FolderTree className="w-4 h-4" />
                <span className="hidden sm:inline">Arquitectura & Fases</span>
              </button>

              <button
                onClick={() => setActiveWorkbenchTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeWorkbenchTab === 'code'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span className="hidden sm:inline">Código Drift Flutter</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {activeWorkbenchTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Phone Simulator */}
            <div className="lg:col-span-6 flex justify-center">
              <MobileSimulator
                settings={settings}
                accounts={accounts}
                categories={categories}
                transactions={transactions}
                reminders={reminders}
                savingsGoals={savingsGoals}
                clients={clients}
                quotes={quotes}
                invoices={invoices}
                timeEntries={timeEntries}
                onAddTransaction={handleAddTransaction}
                onPayReminder={handlePayReminder}
                onUpdateSettings={setSettings}
                onAddSavingsDeposit={handleAddSavingsDeposit}
                onAddClient={handleAddClient}
                onAddQuote={handleAddQuote}
                onConvertQuoteToInvoice={handleConvertQuoteToInvoice}
                onRegisterInvoicePayment={handleRegisterInvoicePayment}
                onToggleTimer={handleToggleTimer}
                onBillTimeEntry={handleBillTimeEntry}
              />
            </div>

            {/* Quick Context & HUD Explanations */}
            <div className="lg:col-span-6 space-y-4 pt-2">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> HUD GENERAL RENOVADO & FASES SIGUIENTES
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Gestión Personal de Ahorros + Módulo Comercial
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  El simulador móvil a la izquierda incluye el interruptor dual en el HUD superior para cambiar entre uso personal y comercial con 1 toque:
                </p>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                    <PiggyBank className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white">Metas de Ahorro Individual:</strong> Barra de progreso visual, cálculo de porcentaje acumulado y botón "Aportar a Meta" que actualiza tu ahorro al instante.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                    <Briefcase className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white">Fases Siguientes (Modo Comercial):</strong> Clientes con CUIT/WhatsApp, Presupuestos formales, Facturas & Cobros con Alias Mercado Pago, y Control de Horas con cronómetro en tiempo real.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white">Temas Visuales Animados:</strong> Probá cambiar a <strong>Sakura 🌸</strong> (caen pétalos de cerezo), <strong>Cyberpunk ⚡</strong> (destellos neón cian/rosa con scanline) o <strong>Luxury ✨</strong> (partículas doradas).
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white">Ayuda Completa al Usuario:</strong> Tocá el botón de ayuda en el simulador o arriba para ver tutoriales paso a paso, regla 50/30/20 y preguntas frecuentes.
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsHelpModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Abrir Centro de Ayuda</span>
                  </button>

                  <button
                    onClick={() => setActiveWorkbenchTab('code')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Ver Código Flutter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeWorkbenchTab === 'flow' && <NavigationFlowDiagram />}

        {activeWorkbenchTab === 'phase0' && <Phase0Doc />}

        {activeWorkbenchTab === 'code' && <FlutterCodeViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-3 text-center text-xs text-slate-500">
        Gestión Personal de Ahorros + Modo Comercial • Drift SQLite en Centavos • Riverpod • 100% Offline
      </footer>

      {/* Global Help Modal */}
      <UserHelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
}
