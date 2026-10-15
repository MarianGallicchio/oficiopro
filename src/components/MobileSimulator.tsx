import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Wallet, 
  Calendar, 
  Bell, 
  Settings, 
  Signal, 
  Wifi, 
  Battery, 
  Sun, 
  Moon, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Lock, 
  Layers, 
  Sparkles,
  ChevronRight,
  X,
  HelpCircle,
  PiggyBank,
  Briefcase,
  Users,
  FileText,
  Receipt,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  DollarSign,
  Phone,
  Target,
  ExternalLink
} from 'lucide-react';
import { 
  Transaction, 
  Reminder, 
  Category, 
  Account, 
  UserAppSettings, 
  SubscriptionTier, 
  TIER_FLAGS,
  AppThemeId,
  SavingsGoal,
  Client,
  Quote,
  Invoice,
  TimeEntry,
  AppDisplayMode
} from '../types';
import { 
  formatMoney, 
  formatDate, 
  getDaysUntil, 
  formatDuration,
  getQuoteWhatsAppUrl,
  getInvoiceReminderWhatsAppUrl
} from '../utils/formatters';
import { ParticleOverlay } from './themes/ParticleOverlay';
import { UserHelpModal } from './UserHelpModal';

interface Props {
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
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onPayReminder: (reminderId: string) => void;
  onUpdateSettings: (settings: UserAppSettings) => void;
  onAddSavingsDeposit: (goalId: string, amountInCents: number) => void;
  onAddClient: (client: Omit<Client, 'id' | 'balancePendingInCents'>) => void;
  onAddQuote: (quote: Omit<Quote, 'id'>) => void;
  onConvertQuoteToInvoice: (quoteId: string) => void;
  onRegisterInvoicePayment: (invoiceId: string, amountInCents: number) => void;
  onToggleTimer: (entryId: string) => void;
  onBillTimeEntry: (entryId: string) => void;
}

export const MobileSimulator: React.FC<Props> = ({
  settings,
  accounts,
  categories,
  transactions,
  reminders,
  savingsGoals,
  clients,
  quotes,
  invoices,
  timeEntries,
  onAddTransaction,
  onPayReminder,
  onUpdateSettings,
  onAddSavingsDeposit,
  onAddClient,
  onAddQuote,
  onConvertQuoteToInvoice,
  onRegisterInvoicePayment,
  onToggleTimer,
  onBillTimeEntry,
}) => {
  // Navigation tabs for Personal vs Commercial
  const [personalTab, setPersonalTab] = useState<'home' | 'savings' | 'reminders' | 'accounts' | 'settings'>('home');
  const [commercialTab, setCommercialTab] = useState<'clients' | 'quotes' | 'invoices' | 'hours'>('clients');
  
  // Quick Expense Modal state (< 10 seconds)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAmountStr, setQuickAmountStr] = useState('0');
  const [quickType, setQuickType] = useState<'expense' | 'income'>('expense');
  const [quickNote, setQuickNote] = useState('');
  
  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAddDepositOpen, setIsAddDepositOpen] = useState<string | null>(null);
  const [depositAmountStr, setDepositAmountStr] = useState('15000');
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isPayInvoiceModalOpen, setIsPayInvoiceModalOpen] = useState<Invoice | null>(null);
  const [invoicePayAmountStr, setInvoicePayAmountStr] = useState('');

  // New Client Form
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('+54 9 11 ');
  const [newClientCuit, setNewClientCuit] = useState('');

  // New Quote Form
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [quoteItemDesc, setQuoteItemDesc] = useState('');
  const [quoteItemPrice, setQuoteItemPrice] = useState('50000');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const flags = TIER_FLAGS[settings.activeTier];
  const currentTime = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // Real-time ticking for time entries
  useEffect(() => {
    const hasRunning = timeEntries.some((t) => t.isRunning);
    if (!hasRunning) return;

    const interval = setInterval(() => {
      // triggers re-render every second for live timer
      setTimerTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeEntries]);

  const [, setTimerTick] = useState(0);

  // Calculations in integer cents
  const totalIncomeCents = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amountInCents, 0);

  const totalExpenseCents = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountInCents, 0);

  const balanceCents = totalIncomeCents - totalExpenseCents;

  // Commercial calculations
  const totalInvoicedCents = invoices.reduce((sum, inv) => sum + inv.totalInCents, 0);
  const totalCollectedCents = invoices.reduce((sum, inv) => sum + inv.paidInCents, 0);
  const totalPendingCollectionCents = totalInvoicedCents - totalCollectedCents;

  // Total savings accumulated
  const totalSavingsCents = savingsGoals.reduce((sum, g) => sum + g.currentAmountInCents, 0);
  const totalSavingsTargetCents = savingsGoals.reduce((sum, g) => sum + g.targetAmountInCents, 0);
  const overallSavingsPercent = totalSavingsTargetCents > 0 
    ? Math.min(100, Math.round((totalSavingsCents / totalSavingsTargetCents) * 100))
    : 0;

  // Daily Allowance calculation
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - today.getDate() + 1);
  const remainingBudget = Math.max(0, settings.monthlyBudgetInCents - totalExpenseCents);
  const dailyAllowanceCents = Math.round(remainingBudget / daysRemaining);

  // Quick Numpad Handlers
  const handleNumpadPress = (digit: string) => {
    if (quickAmountStr === '0') {
      setQuickAmountStr(digit);
    } else if (quickAmountStr.length < 9) {
      setQuickAmountStr(quickAmountStr + digit);
    }
  };

  const handleNumpadBackspace = () => {
    if (quickAmountStr.length <= 1) {
      setQuickAmountStr('0');
    } else {
      setQuickAmountStr(quickAmountStr.slice(0, -1));
    }
  };

  const handleSelectCategoryAndSave = (categoryId: string) => {
    const rawNumber = parseInt(quickAmountStr, 10);
    if (isNaN(rawNumber) || rawNumber <= 0) return;

    // Convert input (whole units) to integer cents (x100)
    const amountInCents = rawNumber * 100;

    onAddTransaction({
      type: quickType,
      accountId: accounts[0].id,
      categoryId,
      amountInCents,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      note: quickNote.trim() || undefined,
    });

    setQuickAmountStr('0');
    setQuickNote('');
    setIsQuickAddOpen(false);
  };

  // Deposit to savings goal handler
  const handleConfirmDeposit = (goalId: string) => {
    const rawNum = parseFloat(depositAmountStr);
    if (isNaN(rawNum) || rawNum <= 0) return;
    const cents = Math.round(rawNum * 100);
    onAddSavingsDeposit(goalId, cents);
    setIsAddDepositOpen(null);
  };

  // Add client handler
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    onAddClient({
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      cuitCuil: newClientCuit.trim() || undefined,
    });
    setNewClientName('');
    setNewClientPhone('+54 9 11 ');
    setNewClientCuit('');
    setIsNewClientOpen(false);
  };

  // Create quote handler
  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    if (!client || !quoteItemDesc.trim()) return;
    const priceCents = (parseFloat(quoteItemPrice) || 0) * 100;

    onAddQuote({
      number: `P-${String(quotes.length + 11).padStart(4, '0')}`,
      clientId: client.id,
      clientName: client.name,
      date: new Date().toISOString().split('T')[0],
      validDays: 15,
      items: [
        {
          id: `item-${Date.now()}`,
          description: quoteItemDesc.trim(),
          quantity: 1,
          unitPriceInCents: priceCents,
          totalInCents: priceCents,
        },
      ],
      subtotalInCents: priceCents,
      taxRatePercent: 0,
      totalInCents: priceCents,
      notes: 'Presupuesto formal válido por 15 días.',
      status: 'sent',
    });

    setQuoteItemDesc('');
    setIsNewQuoteOpen(false);
  };

  // Register payment handler
  const handleConfirmInvoicePayment = () => {
    if (!isPayInvoiceModalOpen) return;
    const amount = (parseFloat(invoicePayAmountStr) || 0) * 100;
    if (amount <= 0) return;
    onRegisterInvoicePayment(isPayInvoiceModalOpen.id, amount);
    setIsPayInvoiceModalOpen(null);
    setInvoicePayAmountStr('');
  };

  // Dynamic theme colors
  const getThemeButtonClass = () => {
    switch (settings.theme) {
      case 'sakura':
        return 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30 text-white';
      case 'cyberpunk':
        return 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/40 border border-cyan-300 font-black';
      case 'golden':
        return 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30 font-bold';
      default:
        return 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30 text-white';
    }
  };

  const getThemeBannerClass = () => {
    switch (settings.theme) {
      case 'sakura':
        return 'bg-gradient-to-br from-pink-500 via-rose-400 to-pink-600 text-white border border-pink-300 shadow-pink-200/50';
      case 'cyberpunk':
        return 'bg-slate-950 text-cyan-300 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20';
      case 'golden':
        return 'bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 text-white border border-amber-400 shadow-amber-500/20';
      default:
        return 'bg-gradient-to-br from-sky-600 to-sky-700 text-white';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-4 w-full">
      {/* Top Simulator Controls (Plan, Theme, Mode, Help) */}
      <div className="w-full max-w-[420px] flex flex-col gap-2 pb-2.5 px-1 text-xs">
        {/* Row 1: Plan Switcher, Dark mode & Help */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
            {(['free', 'premium', 'premium_plus'] as SubscriptionTier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => onUpdateSettings({ ...settings, activeTier: tier })}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition ${
                  settings.activeTier === tier
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tier === 'free' ? 'Gratis' : tier === 'premium' ? 'Premium' : 'Premium+'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold flex items-center gap-1"
              title="Guía y Ayuda Completa"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="text-[10px] hidden sm:inline">Ayuda</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
              title="Modo Claro / Oscuro"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Row 2: Theme Selector */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 pl-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Tema:
          </span>
          <div className="flex gap-1">
            {[
              { id: 'minimal', label: 'Minimal', icon: '◻️' },
              { id: 'sakura', label: 'Sakura 🌸', icon: '🌸' },
              { id: 'cyberpunk', label: 'Cyber ⚡', icon: '⚡' },
              { id: 'golden', label: 'Luxury ✨', icon: '✨' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => onUpdateSettings({ ...settings, theme: t.id as AppThemeId })}
                className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition ${
                  settings.theme === t.id
                    ? t.id === 'sakura'
                      ? 'bg-pink-500 text-white shadow-xs'
                      : t.id === 'cyberpunk'
                      ? 'bg-cyan-400 text-slate-950 font-black shadow-xs'
                      : t.id === 'golden'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device Shell (Simulador Móvil Android con HUD Enriquecido) */}
      <div className={`${isDarkMode || settings.theme === 'cyberpunk' ? 'dark' : ''} w-full flex justify-center`}>
        <div className={`w-full max-w-[420px] h-[820px] rounded-[40px] shadow-2xl ring-8 ring-slate-800/90 dark:ring-slate-950 border overflow-hidden flex flex-col relative select-none transition-colors duration-300 ${
          settings.theme === 'cyberpunk'
            ? 'bg-slate-950 text-cyan-50 border-cyan-500/40'
            : settings.theme === 'sakura'
            ? 'bg-pink-50/20 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-pink-200 dark:border-pink-900/40'
            : settings.theme === 'golden'
            ? 'bg-amber-50/20 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-amber-300/40'
            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-800'
        }`}>
          
          {/* Active Dynamic Particle / Animation Canvas */}
          <ParticleOverlay theme={settings.theme} />
          
          {/* Android Status Bar */}
          <div className="h-8 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-6 flex items-center justify-between text-xs font-bold shrink-0 border-b border-slate-200 dark:border-slate-800 z-20">
            <span>{currentTime}</span>
            <div className="w-16 h-3 bg-slate-300 dark:bg-slate-800 rounded-full" />
            <div className="flex items-center gap-1 text-slate-500">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3 h-3" />
            </div>
          </div>

          {/* APP HUD HEADER: MODE SWITCHER (Personal vs Comercial) & Offline status */}
          <div className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-20 gap-2">
            {/* Dual Mode Switcher Pill */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onUpdateSettings({ ...settings, activeMode: 'personal' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  settings.activeMode === 'personal'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-3 h-3" />
                <span>Personal</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ ...settings, activeMode: 'commercial' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  settings.activeMode === 'commercial'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                <span>Comercial</span>
              </button>
            </div>

            {/* Quick Help & Offline Badge */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
                title="Abrir Ayuda"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Offline
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* MODE 1: GESTIÓN PERSONAL (Ingresos, Gastos, Ahorros, Avisos) */}
          {/* ========================================================= */}
          {settings.activeMode === 'personal' && (
            <>
              {/* TAB: PERSONAL HOME */}
              {personalTab === 'home' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24 z-20">
                  
                  {/* HUD HERO BANNER: DISPONIBLE DIARIO & THEME ACCENTS */}
                  <div className={`p-4 rounded-2xl shadow-md relative overflow-hidden transition-all duration-300 ${getThemeBannerClass()}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 opacity-90">
                        <Zap className="w-3.5 h-3.5 text-amber-300" /> Disponible para hoy
                      </span>
                      <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono">
                        {daysRemaining} días restantes
                      </span>
                    </div>

                    <div className="text-2xl font-black font-mono tracking-tight my-1">
                      {formatMoney(dailyAllowanceCents, settings.currency)}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/20 flex justify-between text-[11px] opacity-90">
                      <span>Saldo total en billeteras:</span>
                      <strong className="font-mono">{formatMoney(balanceCents, settings.currency)}</strong>
                    </div>
                  </div>

                  {/* HUD WIDGET: METAS DE AHORRO CON BARRA INTERACTIVA */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Ahorro Acumulado
                        </span>
                      </div>
                      <button
                        onClick={() => setPersonalTab('savings')}
                        className="text-[10px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-0.5 hover:underline"
                      >
                        Ver metas <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {formatMoney(totalSavingsCents, settings.currency)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Meta global: {formatMoney(totalSavingsTargetCents, settings.currency)} ({overallSavingsPercent}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${overallSavingsPercent}%` }}
                      />
                    </div>

                    {/* Quick Deposit to First Goal */}
                    {savingsGoals.length > 0 && (
                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 truncate max-w-[200px]">
                          Foco: <strong>{savingsGoals[0].name}</strong>
                        </span>
                        <button
                          onClick={() => {
                            setDepositAmountStr('15000');
                            setIsAddDepositOpen(savingsGoals[0].id);
                          }}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold hover:bg-emerald-100 transition"
                        >
                          + Aportar $ 15.000
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Monthly Income & Expense Overview */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" /> Ingresos Mes
                      </span>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        {formatMoney(totalIncomeCents, settings.currency)}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <ArrowDownLeft className="w-3 h-3 text-rose-500" /> Gastos Mes
                      </span>
                      <div className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                        {formatMoney(totalExpenseCents, settings.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Pending Reminders Radar Alert Pill */}
                  {reminders.filter((r) => !r.isPaid).length > 0 && (
                    <div 
                      onClick={() => setPersonalTab('reminders')}
                      className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                            Tenés {reminders.filter((r) => !r.isPaid).length} pagos próximos
                          </span>
                          <span className="text-[10px] text-amber-700 dark:text-amber-400">
                            Tocá para ver y pagar sin intereses
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
                    </div>
                  )}

                  {/* Recent Transactions List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Últimos Movimientos
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">&lt; 10 seg</span>
                    </div>

                    {transactions.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">
                        No hay movimientos cargados todavía.
                      </div>
                    ) : (
                      transactions.slice(0, 6).map((tx) => {
                        const cat = categories.find((c) => c.id === tx.categoryId);
                        const isExpense = tx.type === 'expense';

                        return (
                          <div
                            key={tx.id}
                            className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: cat?.color || '#0284c7' }}
                              >
                                {cat?.name.charAt(0) || '$'}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                                  {cat?.name || 'Varios'}
                                </h5>
                                <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                                  {tx.note || formatDate(tx.date)}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`font-mono text-xs font-black ${
                                isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {isExpense ? '-' : '+'}{formatMoney(tx.amountInCents, settings.currency)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB: GESTIÓN DE AHORROS INDIVIDUALES */}
              {personalTab === 'savings' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24 z-20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm">
                        Metas de Ahorro Individual
                      </h3>
                      <p className="text-[10px] text-slate-500">Planificación financiera sin estrés</p>
                    </div>
                  </div>

                  {/* Savings Goals List */}
                  <div className="space-y-3">
                    {savingsGoals.map((goal) => {
                      const percent = Math.min(100, Math.round((goal.currentAmountInCents / goal.targetAmountInCents) * 100));
                      const remainingCents = Math.max(0, goal.targetAmountInCents - goal.currentAmountInCents);

                      return (
                        <div
                          key={goal.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: goal.color }}
                              >
                                <Target className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                                  {goal.name}
                                </h4>
                                <span className="text-[10px] text-slate-400">
                                  {goal.deadlineDate ? `Meta: ${formatDate(goal.deadlineDate)}` : 'Sin fecha límite'}
                                </span>
                              </div>
                            </div>

                            <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                              {percent}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%`, backgroundColor: goal.color }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Ahorrado:</span>
                              <strong className="font-mono text-slate-900 dark:text-white">
                                {formatMoney(goal.currentAmountInCents, settings.currency)}
                              </strong>
                            </div>

                            <div className="text-right">
                              <span className="text-slate-400 block text-[10px]">Faltan:</span>
                              <span className="font-mono text-slate-500">
                                {formatMoney(remainingCents, settings.currency)}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                              onClick={() => {
                                setDepositAmountStr('20000');
                                setIsAddDepositOpen(goal.id);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Aportar a esta meta</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Financial Rule Tip (50/30/20) */}
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5 flex items-center gap-1">
                      💡 Consejo de Ahorro Inteligente
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      Aparta tu ahorro apenas cobres el ingreso (no al final del mes). Con el 15% o 20% constante, cumples tu Fondo de Emergencia en 4 meses.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: RECORDATORIOS */}
              {personalTab === 'reminders' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24 z-20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm">
                        Recordatorios & Vencimientos
                      </h3>
                      <p className="text-[10px] text-slate-500">Notificaciones locales que no se pierden</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {reminders.map((rem) => {
                      const daysLeft = getDaysUntil(rem.dueDate);
                      const isOverdue = daysLeft < 0;
                      const isDueSoon = daysLeft <= 3 && daysLeft >= 0;

                      return (
                        <div
                          key={rem.id}
                          className={`p-3 rounded-xl border shadow-xs transition ${
                            rem.isPaid
                              ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
                              : isOverdue
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                              : isDueSoon
                              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                {rem.frequency === 'monthly' ? 'Mensual' : 'Único'}
                              </span>
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                                {rem.title}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>Vence: {formatDate(rem.dueDate)} a las {rem.dueTime} hs</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-mono text-xs font-black text-slate-900 dark:text-white block">
                                {formatMoney(rem.amountInCents, settings.currency)}
                              </span>

                              <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold mt-1 ${
                                rem.isPaid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isOverdue
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {rem.isPaid ? 'Pagado' : isOverdue ? 'Vencido' : `En ${daysLeft} días`}
                              </span>
                            </div>
                          </div>

                          {!rem.isPaid && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                              <button
                                onClick={() => onPayReminder(rem.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1 transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Marcar Pagado (Crea Gasto)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: CUENTAS & BILLETERAS */}
              {personalTab === 'accounts' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24 z-20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm">
                        Cuentas & Billeteras
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        {flags.maxAccounts === 1 ? 'Plan Gratis: 1 cuenta permitida' : 'Plan Premium: Cuentas ilimitadas'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {accounts.map((acc, index) => {
                      const isBlockedByPlan = index >= flags.maxAccounts;

                      return (
                        <div
                          key={acc.id}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            isBlockedByPlan
                              ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: acc.color }}
                            >
                              <Wallet className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                                {acc.name}
                              </h4>
                              <span className="text-[10px] text-slate-400">
                                {isBlockedByPlan ? 'Bloqueada (Requiere Plan Premium)' : 'Activa en SQLite'}
                              </span>
                            </div>
                          </div>

                          {isBlockedByPlan && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                              <Lock className="w-3 h-3" /> Premium
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: AJUSTES & BACKUP */}
              {personalTab === 'settings' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24 z-20 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Configuración Personal
                    </h4>
                    
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Símbolo de Moneda</label>
                      <input
                        type="text"
                        value={settings.currency.symbol}
                        onChange={(e) => onUpdateSettings({
                          ...settings,
                          currency: { ...settings.currency, symbol: e.target.value }
                        })}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Presupuesto Mensual Estimado ($)</label>
                      <input
                        type="number"
                        step="10000"
                        value={settings.monthlyBudgetInCents / 100}
                        onChange={(e) => onUpdateSettings({
                          ...settings,
                          monthlyBudgetInCents: (parseFloat(e.target.value) || 0) * 100
                        })}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Copia de Seguridad Offline (JSON)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tus datos son tuyos. Exportá un archivo .json completo en tu teléfono para restaurarlo cuando quieras sin internet.
                    </p>
                    <button
                      onClick={() => {
                        const backupData = {
                          settings,
                          accounts,
                          categories,
                          transactions,
                          reminders,
                          savingsGoals,
                          clients,
                          quotes,
                          invoices,
                          timeEntries,
                          exportedAt: new Date().toISOString(),
                        };
                        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `backup_finanzas_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-lg border border-slate-300 dark:border-slate-700 transition"
                    >
                      Descargar Copia de Seguridad JSON
                    </button>
                  </div>
                </div>
              )}

              {/* FLOATING ACTION BUTTON: FAST EXPENSE < 10 SECONDS */}
              <div className="absolute bottom-16 right-4 z-30">
                <button
                  onClick={() => {
                    setQuickType('expense');
                    setQuickAmountStr('0');
                    setIsQuickAddOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-3 active:scale-95 font-black text-xs rounded-full shadow-lg transition ${getThemeButtonClass()}`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Gasto Rápido</span>
                </button>
              </div>

              {/* BOTTOM NAVIGATION BAR: PERSONAL */}
              <nav className="h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 shrink-0 z-20">
                <button
                  onClick={() => setPersonalTab('home')}
                  className={`flex flex-col items-center justify-center w-12 py-1 transition ${
                    personalTab === 'home' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${personalTab === 'home' ? 'bg-sky-100 dark:bg-sky-950/60' : ''}`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-[9px]">Inicio</span>
                </button>

                <button
                  onClick={() => setPersonalTab('savings')}
                  className={`flex flex-col items-center justify-center w-12 py-1 transition ${
                    personalTab === 'savings' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${personalTab === 'savings' ? 'bg-sky-100 dark:bg-sky-950/60' : ''}`}>
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <span className="text-[9px]">Ahorros</span>
                </button>

                <button
                  onClick={() => setPersonalTab('reminders')}
                  className={`flex flex-col items-center justify-center w-12 py-1 transition ${
                    personalTab === 'reminders' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${personalTab === 'reminders' ? 'bg-sky-100 dark:bg-sky-950/60' : ''}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="text-[9px]">Avisos</span>
                </button>

                <button
                  onClick={() => setPersonalTab('accounts')}
                  className={`flex flex-col items-center justify-center w-12 py-1 transition ${
                    personalTab === 'accounts' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${personalTab === 'accounts' ? 'bg-sky-100 dark:bg-sky-950/60' : ''}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[9px]">Cuentas</span>
                </button>

                <button
                  onClick={() => setPersonalTab('settings')}
                  className={`flex flex-col items-center justify-center w-12 py-1 transition ${
                    personalTab === 'settings' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${personalTab === 'settings' ? 'bg-sky-100 dark:bg-sky-950/60' : ''}`}>
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-[9px]">Ajustes</span>
                </button>
              </nav>
            </>
          )}

          {/* ========================================================= */}
          {/* MODE 2: USO COMERCIAL / FREELANCERS / OFICIOS (FASES SIGUIENTES) */}
          {/* ========================================================= */}
          {settings.activeMode === 'commercial' && (
            <>
              {/* COMMERCIAL SUMMARY BANNER */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0 z-20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Facturación & Cobranzas
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                    Alias: {settings.businessProfile.aliasCbuMp}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-bold">Total Facturado</span>
                    <strong className="text-[11px] font-mono text-slate-900 dark:text-white">
                      {formatMoney(totalInvoicedCents, settings.currency)}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-bold">Cobrado</span>
                    <strong className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      {formatMoney(totalCollectedCents, settings.currency)}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                    <span className="text-[9px] text-rose-600 dark:text-rose-400 block font-bold">Por Cobrar</span>
                    <strong className="text-[11px] font-mono text-rose-600 dark:text-rose-400">
                      {formatMoney(totalPendingCollectionCents, settings.currency)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* COMMERCIAL SUB-TAB 1: CLIENTES */}
              {commercialTab === 'clients' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20 z-20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs">
                        Clientes & Cuentas Corrientes ({clients.length})
                      </h4>
                      <p className="text-[10px] text-slate-500">Contactos con CUIT y WhatsApp</p>
                    </div>

                    <button
                      onClick={() => setIsNewClientOpen(true)}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-lg shadow-xs flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nuevo Cliente</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {clients.map((client) => {
                      const cleanPhone = client.phone.replace(/[^0-9]/g, '');
                      const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(client.name)}%2C%20un%20saludo%20de%20${encodeURIComponent(settings.businessProfile.businessName)}`;

                      return (
                        <div
                          key={client.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                                {client.name}
                              </h5>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                CUIT: {client.cuitCuil || 'Consumidor Final'}
                              </span>
                            </div>

                            {client.balancePendingInCents > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[10px] font-mono font-bold">
                                Debe {formatMoney(client.balancePendingInCents, settings.currency)}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold">
                                Al día
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 truncate max-w-[170px]">
                              {client.phone}
                            </span>

                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COMMERCIAL SUB-TAB 2: PRESUPUESTOS */}
              {commercialTab === 'quotes' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20 z-20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs">
                        Presupuestos & Cotizaciones
                      </h4>
                      <p className="text-[10px] text-slate-500">Envío formal por WhatsApp en 1 toque</p>
                    </div>

                    <button
                      onClick={() => setIsNewQuoteOpen(true)}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-lg shadow-xs flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Crear Cotización</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {quotes.map((quote) => {
                      const waLink = getQuoteWhatsAppUrl(quote, settings.businessProfile);

                      return (
                        <div
                          key={quote.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-mono font-bold text-sky-600 dark:text-sky-400">
                                {quote.number} • {formatDate(quote.date)}
                              </span>
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                                {quote.clientName}
                              </h5>
                            </div>

                            <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                              {formatMoney(quote.totalInCents, settings.currency)}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                            {quote.items.map((it) => (
                              <div key={it.id} className="flex justify-between">
                                <span className="truncate max-w-[200px]">• {it.description}</span>
                                <strong className="font-mono">{formatMoney(it.totalInCents, settings.currency)}</strong>
                              </div>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 justify-end">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Enviar WhatsApp</span>
                            </a>

                            <button
                              onClick={() => onConvertQuoteToInvoice(quote.id)}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Convertir a Factura</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COMMERCIAL SUB-TAB 3: FACTURAS & COBROS */}
              {commercialTab === 'invoices' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20 z-20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs">
                        Facturas & Cobros Pendientes
                      </h4>
                      <p className="text-[10px] text-slate-500">Cobrá con Alias y evitá deudores</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {invoices.map((inv) => {
                      const isPaid = inv.status === 'paid';
                      const pendingCents = inv.totalInCents - inv.paidInCents;
                      const reminderWa = getInvoiceReminderWhatsAppUrl(inv, settings.businessProfile);

                      return (
                        <div
                          key={inv.id}
                          className={`p-3 rounded-xl border shadow-xs space-y-2 transition ${
                            isPaid
                              ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-70'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block">
                                {inv.docType} N° {inv.number}
                              </span>
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                                {inv.clientName}
                              </h5>
                              <span className="text-[10px] text-slate-500">
                                Vence: {formatDate(inv.dueDate)}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-mono font-black text-slate-900 dark:text-white block">
                                {formatMoney(inv.totalInCents, settings.currency)}
                              </span>

                              <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold mt-1 ${
                                isPaid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isPaid ? 'Cobrado' : `Pendiente: ${formatMoney(pendingCents, settings.currency)}`}
                              </span>
                            </div>
                          </div>

                          {!isPaid && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 justify-end">
                              <a
                                href={reminderWa}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>Reclamar Cobro</span>
                              </a>

                              <button
                                onClick={() => {
                                  setIsPayInvoiceModalOpen(inv);
                                  setInvoicePayAmountStr(String(pendingCents / 100));
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition"
                              >
                                <Check className="w-3 h-3" />
                                <span>Registrar Cobro</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COMMERCIAL SUB-TAB 4: CONTROL DE HORAS EN VIVO */}
              {commercialTab === 'hours' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20 z-20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs">
                        Control de Horas de Trabajo
                      </h4>
                      <p className="text-[10px] text-slate-500">Cronómetro en vivo y valor por hora</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {timeEntries.map((entry) => {
                      const estimatedTotalCents = Math.round((entry.secondsLogged / 3600) * entry.hourlyRateInCents);

                      return (
                        <div
                          key={entry.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 block">
                                {entry.clientName}
                              </span>
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                                {entry.description}
                              </h5>
                              <span className="text-[10px] text-slate-400">
                                Valor hora: {formatMoney(entry.hourlyRateInCents, settings.currency)}/h
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">
                                {formatDuration(entry.secondsLogged)}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-600 font-bold">
                                {formatMoney(estimatedTotalCents, settings.currency)}
                              </span>
                            </div>
                          </div>

                          {/* Live Timer Controls */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <button
                              onClick={() => onToggleTimer(entry.id)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                                entry.isRunning
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                            >
                              {entry.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              <span>{entry.isRunning ? 'Pausar' : 'Iniciar'}</span>
                            </button>

                            <button
                              onClick={() => onBillTimeEntry(entry.id)}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] flex items-center gap-1 transition"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Facturar Horas</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COMMERCIAL BOTTOM NAVIGATION BAR */}
              <nav className="h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 shrink-0 z-20">
                <button
                  onClick={() => setCommercialTab('clients')}
                  className={`flex flex-col items-center justify-center w-14 py-1 transition ${
                    commercialTab === 'clients' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${commercialTab === 'clients' ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[9px]">Clientes</span>
                </button>

                <button
                  onClick={() => setCommercialTab('quotes')}
                  className={`flex flex-col items-center justify-center w-14 py-1 transition ${
                    commercialTab === 'quotes' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${commercialTab === 'quotes' ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[9px]">Presupuestos</span>
                </button>

                <button
                  onClick={() => setCommercialTab('invoices')}
                  className={`flex flex-col items-center justify-center w-14 py-1 transition ${
                    commercialTab === 'invoices' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${commercialTab === 'invoices' ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''}`}>
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-[9px]">Cobros</span>
                </button>

                <button
                  onClick={() => setCommercialTab('hours')}
                  className={`flex flex-col items-center justify-center w-14 py-1 transition ${
                    commercialTab === 'hours' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${commercialTab === 'hours' ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[9px]">Horas</span>
                </button>
              </nav>
            </>
          )}

          {/* Android Pill */}
          <div className="h-3 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 z-20">
            <div className="w-20 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {/* ========================================================= */}
          {/* MODALS: ULTRA-FAST EXPENSE ENTRY (< 10 SECONDS) */}
          {/* ========================================================= */}
          {isQuickAddOpen && (
            <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex flex-col justify-end">
              <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-4 shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[92%] flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuickType('expense')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        quickType === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Gasto
                    </button>
                    <button
                      onClick={() => setQuickType('income')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        quickType === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Ingreso
                    </button>
                  </div>

                  <button
                    onClick={() => setIsQuickAddOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Big Amount Display */}
                <div className="text-center py-2">
                  <span className="text-xs text-slate-400">Importe</span>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {settings.currency.symbol} {parseInt(quickAmountStr, 10).toLocaleString('es-AR')}
                  </div>
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-1.5 my-2 max-w-[280px] mx-auto w-full">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        if (k === '⌫') handleNumpadBackspace();
                        else handleNumpadPress(k);
                      }}
                      className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-mono font-bold text-base active:scale-95 transition"
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* 1-Tap Category Selector to Save */}
                <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 text-center">
                    Toca la categoría para guardar en 1 toque:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {categories
                      .filter((c) => c.type === quickType)
                      .slice(0, 6)
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategoryAndSave(cat.id)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-sky-500 text-center transition active:scale-95"
                        >
                          <div 
                            className="w-6 h-6 rounded-md mx-auto mb-1 flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: cat.color }}
                          >
                            {cat.name.charAt(0)}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block truncate">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: ADD SAVINGS DEPOSIT */}
          {isAddDepositOpen && (
            <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800 max-w-xs w-full space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Aportar a Meta de Ahorro
                  </h4>
                  <button onClick={() => setIsAddDepositOpen(null)} className="text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Monto a depositar ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={depositAmountStr}
                    onChange={(e) => setDepositAmountStr(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsAddDepositOpen(null)}
                    className="px-3 py-1 text-slate-500 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleConfirmDeposit(isAddDepositOpen)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs"
                  >
                    Confirmar Aporte
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: CREATE NEW CLIENT */}
          {isNewClientOpen && (
            <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
              <form onSubmit={handleCreateClient} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800 max-w-xs w-full space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Nuevo Cliente Comercial
                  </h4>
                  <button type="button" onClick={() => setIsNewClientOpen(false)} className="text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Nombre o Razón Social</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Distribuidora Santa Fe"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">CUIT / CUIL (Opcional)</label>
                  <input
                    type="text"
                    placeholder="30-..."
                    value={newClientCuit}
                    onChange={(e) => setNewClientCuit(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsNewClientOpen(false)}
                    className="px-3 py-1 text-slate-500 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-xs"
                  >
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODAL: CREATE NEW QUOTE */}
          {isNewQuoteOpen && (
            <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
              <form onSubmit={handleCreateQuote} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800 max-w-xs w-full space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Crear Presupuesto Rápido
                  </h4>
                  <button type="button" onClick={() => setIsNewQuoteOpen(false)} className="text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Cliente Destinatario</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Descripción del Trabajo</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Reparación de tablero y cableado"
                    value={quoteItemDesc}
                    onChange={(e) => setQuoteItemDesc(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Precio Total ($)</label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={quoteItemPrice}
                    onChange={(e) => setQuoteItemPrice(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsNewQuoteOpen(false)}
                    className="px-3 py-1 text-slate-500 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-xs"
                  >
                    Generar Cotización
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODAL: REGISTER INVOICE PAYMENT */}
          {isPayInvoiceModalOpen && (
            <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800 max-w-xs w-full space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Registrar Cobro de Factura
                  </h4>
                  <button onClick={() => setIsPayInvoiceModalOpen(null)} className="text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-500">
                  Cliente: <strong>{isPayInvoiceModalOpen.clientName}</strong>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Monto recibido ($)</label>
                  <input
                    type="number"
                    value={invoicePayAmountStr}
                    onChange={(e) => setInvoicePayAmountStr(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => setIsPayInvoiceModalOpen(null)}
                    className="px-3 py-1 text-slate-500 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmInvoicePayment}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs"
                  >
                    Cobrar & Ingresar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Complete User Help Modal */}
      <UserHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
