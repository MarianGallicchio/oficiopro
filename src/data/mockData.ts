import { 
  Account, 
  Category, 
  Transaction, 
  Reminder, 
  UserAppSettings, 
  SavingsGoal, 
  Client, 
  Quote, 
  Invoice, 
  TimeEntry 
} from '../types';

export const INITIAL_SETTINGS: UserAppSettings = {
  currency: {
    code: 'ARS',
    symbol: '$',
    name: 'Pesos Argentinos',
    decimals: 2,
  },
  activeTier: 'premium_plus',
  enableNotifications: true,
  dailyReminderTime: '21:30',
  monthlyBudgetInCents: 45000000, // $ 450.000,00
  differentiatorMode: 'daily_allowance',
  theme: 'minimal',
  activeMode: 'personal',
  businessProfile: {
    businessName: 'Servicios Profesionales & Técnicos',
    ownerName: 'Mariano Gómez',
    cuit: '20-39485721-3',
    ivaCondition: 'Monotributo',
    aliasCbuMp: 'mariano.electricidad.mp',
    phone: '+54 9 11 5849-2041',
    email: 'contacto@marianoservicios.com.ar',
  },
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Billetera de Bolsillo (Efectivo)',
    color: '#0284c7',
    icon: 'wallet',
    isArchived: false,
    balanceInCents: 4500000,
  },
  {
    id: 'acc-2',
    name: 'Caja de Ahorro Santander',
    color: '#059669',
    icon: 'landmark',
    isArchived: false,
    balanceInCents: 28000000,
  },
  {
    id: 'acc-3',
    name: 'Mercado Pago (Cobros & QR)',
    color: '#0284c7',
    icon: 'smartphone',
    isArchived: false,
    balanceInCents: 6540000,
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Gastos
  { id: 'cat-food', name: 'Alimentos & Super', type: 'expense', icon: 'utensils', color: '#f97316', isSystem: true, budgetAmountInCents: 15000000 },
  { id: 'cat-transport', name: 'Transporte & Nafta', type: 'expense', icon: 'car', color: '#0ea5e9', isSystem: true, budgetAmountInCents: 6000000 },
  { id: 'cat-home', name: 'Hogar & Servicios', type: 'expense', icon: 'home', color: '#8b5cf6', isSystem: true, budgetAmountInCents: 8500000 },
  { id: 'cat-health', name: 'Salud & Farmacia', type: 'expense', icon: 'heart', color: '#ef4444', isSystem: true, budgetAmountInCents: 4000000 },
  { id: 'cat-leisure', name: 'Salidas & Ocio', type: 'expense', icon: 'coffee', color: '#ec4899', isSystem: true, budgetAmountInCents: 5000000 },
  { id: 'cat-taxes', name: 'Impuestos & Monotributo', type: 'expense', icon: 'file-text', color: '#64748b', isSystem: true, budgetAmountInCents: 6500000 },
  { id: 'cat-savings', name: 'Ahorro & Inversión', type: 'expense', icon: 'piggy-bank', color: '#10b981', isSystem: true, budgetAmountInCents: 10000000 },
  // Ingresos
  { id: 'cat-salary', name: 'Sueldo Fijo / Retiro', type: 'income', icon: 'briefcase', color: '#10b981', isSystem: true },
  { id: 'cat-sales', name: 'Cobro de Trabajos / Facturas', type: 'income', icon: 'trending-up', color: '#06b6d4', isSystem: true },
  { id: 'cat-extras', name: 'Changas & Rendimientos', type: 'income', icon: 'dollar-sign', color: '#84cc16', isSystem: true },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Fondo de Emergencia (3 meses)',
    targetAmountInCents: 90000000, // $ 900.000,00
    currentAmountInCents: 54000000, // $ 540.000,00 (60%)
    deadlineDate: '2026-12-31',
    icon: 'shield-check',
    color: '#059669',
    isCompleted: false,
  },
  {
    id: 'goal-2',
    name: 'Renovación de Herramientas de Trabajo',
    targetAmountInCents: 35000000, // $ 350.000,00
    currentAmountInCents: 28000000, // $ 280.000,00 (80%)
    deadlineDate: '2026-06-30',
    icon: 'wrench',
    color: '#0284c7',
    isCompleted: false,
  },
  {
    id: 'goal-3',
    name: 'Vacaciones en las Sierras',
    targetAmountInCents: 40000000, // $ 400.000,00
    currentAmountInCents: 12000000, // $ 120.000,00 (30%)
    deadlineDate: '2027-01-15',
    icon: 'palmtree',
    color: '#f59e0b',
    isCompleted: false,
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Estudio de Arquitectura Belgrano',
    phone: '+54 9 11 4920-1847',
    email: 'administracion@estudiobelgrano.com.ar',
    cuitCuil: '30-71489201-4',
    address: 'Av. Cabildo 2450, Piso 6, CABA',
    notes: 'Pagan a 15 días previa Factura C electrónica.',
    balancePendingInCents: 18500000, // $ 185.000 pendiente
  },
  {
    id: 'cli-2',
    name: 'Taller Mecánico Don Pepe',
    phone: '+54 9 11 3829-9481',
    email: 'donpepe.lanus@gmail.com',
    cuitCuil: '20-22445588-3',
    address: 'Hipólito Yrigoyen 4120, Lanús',
    notes: 'Acepta presupuestos por WhatsApp. Paga en efectivo o MP.',
    balancePendingInCents: 0,
  },
  {
    id: 'cli-3',
    name: 'Dra. Silvina Rossi (Consultorio)',
    phone: '+54 9 11 6712-4091',
    email: 'silvina.rossi@medicos.com.ar',
    cuitCuil: '27-28391024-8',
    address: 'Santa Fe 1820, Recoleta, CABA',
    notes: 'Instalación de luminaria y cableado de red.',
    balancePendingInCents: 6200000, // $ 62.000 pendiente
  },
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'q-101',
    number: 'P-0010',
    clientId: 'cli-1',
    clientName: 'Estudio de Arquitectura Belgrano',
    date: '2026-03-10',
    validDays: 15,
    items: [
      { id: 'qi-1', description: 'Reconfiguración y peinado de tablero eléctrico general', quantity: 1, unitPriceInCents: 12000000, totalInCents: 12000000 },
      { id: 'qi-2', description: 'Tendido de 4 bocas dobles de red Cat6 certificadas', quantity: 4, unitPriceInCents: 1625000, totalInCents: 6500000 },
    ],
    subtotalInCents: 18500000,
    taxRatePercent: 0, // Monotributista
    totalInCents: 18500000,
    notes: 'Incluye mano de obra calificada y materiales de primera línea Schneider.',
    status: 'sent',
  },
  {
    id: 'q-102',
    number: 'P-0011',
    clientId: 'cli-2',
    clientName: 'Taller Mecánico Don Pepe',
    date: '2026-03-14',
    validDays: 10,
    items: [
      { id: 'qi-3', description: 'Instalación de circuito trifásico para elevador hidráulico', quantity: 1, unitPriceInCents: 9500000, totalInCents: 9500000 },
    ],
    subtotalInCents: 9500000,
    taxRatePercent: 0,
    totalInCents: 9500000,
    notes: 'Presupuesto congelado por 10 días.',
    status: 'approved',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-201',
    number: '0001-00000042',
    docType: 'Factura C',
    clientId: 'cli-1',
    clientName: 'Estudio de Arquitectura Belgrano',
    date: '2026-03-05',
    dueDate: '2026-03-20',
    items: [
      { id: 'ii-1', description: 'Mano de obra diagnóstico eléctrico y recambio de térmicas', quantity: 1, unitPriceInCents: 18500000, totalInCents: 18500000 },
    ],
    totalInCents: 18500000,
    paidInCents: 0,
    status: 'unpaid',
    notes: 'Transferencia bancaria o Mercado Pago con Alias informado.',
  },
  {
    id: 'inv-202',
    number: '0001-00000041',
    docType: 'Remito X',
    clientId: 'cli-3',
    clientName: 'Dra. Silvina Rossi (Consultorio)',
    date: '2026-03-02',
    dueDate: '2026-03-12',
    items: [
      { id: 'ii-2', description: 'Instalación luminaria LED cálida y timbres', quantity: 1, unitPriceInCents: 6200000, totalInCents: 6200000 },
    ],
    totalInCents: 6200000,
    paidInCents: 0,
    status: 'unpaid',
    notes: 'Cobro en mano o QR.',
  },
  {
    id: 'inv-203',
    number: '0001-00000040',
    docType: 'Factura C',
    clientId: 'cli-2',
    clientName: 'Taller Mecánico Don Pepe',
    date: '2026-02-20',
    dueDate: '2026-02-28',
    items: [
      { id: 'ii-3', description: 'Mantenimiento compresor y puesta a tierra', quantity: 1, unitPriceInCents: 14000000, totalInCents: 14000000 },
    ],
    totalInCents: 14000000,
    paidInCents: 14000000,
    status: 'paid',
  },
];

export const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  {
    id: 'time-1',
    clientId: 'cli-1',
    clientName: 'Estudio de Arquitectura Belgrano',
    description: 'Armado de planos unifilares y cálculo de cargas térmicas',
    hourlyRateInCents: 650000, // $ 6.500 / hora
    secondsLogged: 3600 * 3.5, // 3.5 horas
    date: '2026-03-13',
    isRunning: false,
    isInvoiced: false,
  },
  {
    id: 'time-2',
    clientId: 'cli-3',
    clientName: 'Dra. Silvina Rossi (Consultorio)',
    description: 'Búsqueda de fuga a tierra en circuito secundario',
    hourlyRateInCents: 650000,
    secondsLogged: 3600 * 2, // 2 horas
    date: '2026-03-14',
    isRunning: false,
    isInvoiced: false,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    accountId: 'acc-2',
    categoryId: 'cat-sales',
    amountInCents: 14000000, // $ 140.000,00 cobro Factura C
    date: '2026-03-01',
    time: '10:30',
    note: 'Cobro Factura C Don Pepe (Taller)',
    clientId: 'cli-2',
    invoiceId: 'inv-203',
  },
  {
    id: 'tx-2',
    type: 'income',
    accountId: 'acc-2',
    categoryId: 'cat-salary',
    amountInCents: 32000000, // $ 320.000,00 ingreso fijo
    date: '2026-03-02',
    time: '09:00',
    note: 'Retiro quincenal de ingresos',
  },
  {
    id: 'tx-3',
    type: 'expense',
    accountId: 'acc-1',
    categoryId: 'cat-food',
    amountInCents: 3850000, // $ 38.500,00
    date: '2026-03-05',
    time: '18:30',
    note: 'Supermercado Coto',
  },
  {
    id: 'tx-4',
    type: 'expense',
    accountId: 'acc-3',
    categoryId: 'cat-transport',
    amountInCents: 2400000, // $ 24.000,00
    date: '2026-03-08',
    time: '11:15',
    note: 'Carga Nafta Súper YPF',
  },
  {
    id: 'tx-5',
    type: 'expense',
    accountId: 'acc-1',
    categoryId: 'cat-savings',
    amountInCents: 15000000, // $ 150.000 ahorro apartado
    date: '2026-03-09',
    time: '12:00',
    note: 'Aporte al Fondo de Emergencia',
    savingsGoalId: 'goal-1',
  },
  {
    id: 'tx-6',
    type: 'expense',
    accountId: 'acc-2',
    categoryId: 'cat-home',
    amountInCents: 2150000, // $ 21.500,00
    date: '2026-03-12',
    time: '14:20',
    note: 'Pago Internet y telefonía',
  },
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Monotributo AFIP (Vence 20)',
    amountInCents: 2650000, // $ 26.500,00
    dueDate: '2026-03-20',
    dueTime: '10:00',
    frequency: 'monthly',
    categoryId: 'cat-taxes',
    accountId: 'acc-2',
    isPaid: false,
    notes: 'Pagar con VEP o débito automático en cuenta.',
  },
  {
    id: 'rem-2',
    title: 'Internet & Cable Fibertel',
    amountInCents: 2150000, // $ 21.500,00
    dueDate: '2026-03-22',
    dueTime: '11:00',
    frequency: 'monthly',
    categoryId: 'cat-home',
    accountId: 'acc-2',
    isPaid: false,
    notes: 'Evitar corte y reconexión.',
  },
  {
    id: 'rem-3',
    title: 'Resumen Tarjeta Visa Santander',
    amountInCents: 5840000, // $ 58.400,00
    dueDate: '2026-03-25',
    dueTime: '09:00',
    frequency: 'monthly',
    categoryId: 'cat-taxes',
    accountId: 'acc-2',
    isPaid: false,
    notes: 'Pago total del resumen sin intereses punitorios.',
  },
];
