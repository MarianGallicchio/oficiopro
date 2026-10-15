import React, { useState } from 'react';
import { 
  FolderTree, 
  Database, 
  Smartphone, 
  ShieldAlert, 
  Sparkles, 
  Copy, 
  Check, 
  CheckCircle2, 
  Layers, 
  Code2, 
  Zap, 
  Calendar, 
  DollarSign, 
  Flame,
  ArrowRight
} from 'lucide-react';

export const Phase0Doc: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plan' | 'model' | 'folders' | 'flow' | 'differentials' | 'risks'>('plan');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const driftCode = `// lib/core/database/tables/accounts_table.dart
import 'package:drift/drift.dart';

class Accounts extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get uuid => text().unique()();
  TextColumn get name => text().withLength(min: 1, max: 80)();
  TextColumn get color => text().withDefault(const Constant('#0284c7'))();
  TextColumn get icon => text().withDefault(const Constant('wallet'))();
  BoolColumn get isArchived => boolean().withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

// lib/core/database/tables/categories_table.dart
class Categories extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get uuid => text().unique()();
  TextColumn get name => text().withLength(min: 1, max: 60)();
  TextColumn get type => text()(); // 'expense' o 'income'
  TextColumn get icon => text()();
  TextColumn get color => text()();
  BoolColumn get isSystem => boolean().withDefault(const Constant(true))();
  IntColumn get budgetAmountInCents => integer().nullable()(); // Plan Premium
}

// lib/core/database/tables/transactions_table.dart
class Transactions extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get uuid => text().unique()();
  TextColumn get type => text()(); // 'expense' o 'income'
  IntColumn get accountId => integer().references(Accounts, #id, onDelete: KeyAction.cascade)();
  IntColumn get categoryId => integer().references(Categories, #id, onDelete: KeyAction.restrict)();
  // DINERO: SIEMPRE GUARDADO COMO ENTERO EN CENTAVOS ($150.50 -> 15050)
  IntColumn get amountInCents => integer()();
  DateTimeColumn get date => dateTime()();
  TextColumn get note => text().nullable()();
  IntColumn get reminderId => integer().nullable().references(Reminders, #id, onDelete: KeyAction.setNull)();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

// lib/core/database/tables/reminders_table.dart
class Reminders extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get uuid => text().unique()();
  TextColumn get title => text().withLength(min: 1, max: 100)();
  IntColumn get amountInCents => integer()();
  DateTimeColumn get dueDate => dateTime()();
  TextColumn get dueTime => text()(); // 'HH:mm'
  TextColumn get frequency => text().withDefault(const Constant('monthly'))(); // once, daily, weekly, monthly, yearly
  IntColumn get categoryId => integer().references(Categories, #id, onDelete: KeyAction.restrict)();
  IntColumn get accountId => integer().references(Accounts, #id, onDelete: KeyAction.cascade)();
  BoolColumn get isPaid => boolean().withDefault(const Constant(false))();
  DateTimeColumn get paidAt => dateTime().nullable()();
  TextColumn get notes => text().nullable()();
}

// lib/core/database/tables/app_settings_table.dart
class AppSettingsTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get currencyCode => text().withDefault(const Constant('ARS'))();
  TextColumn get currencySymbol => text().withDefault(const Constant('$'))();
  TextColumn get activeTier => text().withDefault(const Constant('free'))(); // free, premium, premium_plus
  BoolColumn get enableNotifications => boolean().withDefault(const Constant(true))();
  TextColumn get dailyReminderTime => text().withDefault(const Constant('21:30'))();
}`;

  const folderStructureText = `lib/
├── app.dart                   # MaterialApp, temas Material 3 (claro/oscuro), locales
├── main.dart                  # Inicialización offline (Drift + NotificationPlugin + Riverpod)
├── core/
│   ├── database/              # Esquema SQLite Drift relacional
│   │   ├── app_database.dart
│   │   ├── app_database.g.dart
│   │   ├── tables/
│   │   │   ├── accounts_table.dart
│   │   │   ├── categories_table.dart
│   │   │   ├── transactions_table.dart
│   │   │   ├── reminders_table.dart
│   │   │   └── app_settings_table.dart
│   │   └── daos/              # Data Access Objects reactivos (Streams)
│   ├── plans/                 # SISTEMA DE FEATURE FLAGS (Gratis / Premium / Premium+)
│   │   ├── subscription_tier.dart
│   │   ├── feature_flags.dart
│   │   └── plan_guard.dart    # Widget que oculta o bloquea funciones según el plan
│   ├── notifications/         # Servicio de alarmas exactas y reinicio del móvil
│   │   ├── notification_service.dart
│   │   └── boot_receiver.dart
│   ├── theme/                 # Paleta Material 3 minimalista de alto contraste
│   └── utils/                 # Formateo de dinero en centavos (IntToCurrency) y fechas
└── features/                  # FEATURE-FIRST: Módulos independientes
    ├── transactions/          # MÓDULO NÚCLEO: Ingresos y Gastos (<10 seg)
    │   ├── data/
    │   ├── domain/
    │   └── presentation/
    │       ├── screens/
    │       │   ├── home_dashboard_screen.dart
    │       │   └── quick_add_expense_screen.dart
    │       └── widgets/
    │           ├── quick_numpad.dart
    │           └── category_selector.dart
    ├── reminders/             # MÓDULO: Recordatorios y Pagos Recurrentes
    │   ├── presentation/
    │   │   ├── screens/reminders_list_screen.dart
    │   │   └── widgets/reminder_card.dart
    ├── accounts/              # Billeteras (1 en gratis, N en premium)
    ├── budgets/               # Presupuestos por categoría (Función Premium)
    ├── reports/               # Reportes gráficos y exportación (Función Premium)
    └── freelance/             # MÓDULO PREMIUM+ (Clientes, presupuestos, facturas, horas)`;

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> FASE 0: DISEÑO INTEGRAL DE ARQUITECTURA
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            App de Finanzas Personales & Recordatorios
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
            Arquitectura Feature-First con soporte de Planes (Gratis / Premium / Premium+), dinero en centavos y 100% offline.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'plan' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            (a) Plan
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'model' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            (b) Datos (Centavos)
          </button>
          <button
            onClick={() => setActiveTab('folders')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'folders' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            (c) Carpetas
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'flow' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            (d) Flujo (&lt;10 seg)
          </button>
          <button
            onClick={() => setActiveTab('differentials')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'differentials' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            (e) 3 Diferenciales
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'risks' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            (f) Riesgos
          </button>
        </div>
      </div>

      {/* SECTION A: PLAN */}
      {activeTab === 'plan' && (
        <div className="mt-5 space-y-4 text-xs">
          <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800">
            <h3 className="font-black text-sm text-sky-950 dark:text-sky-200 mb-1">
              (a) Plan Resumido de Construcción y Lanzamiento
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Trabajamos una fase a la vez. Cada entrega es ejecutable y lista para compilar en tu computadora:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { num: 'Fase 0', title: 'Fundamentos & Arquitectura (Actual)', desc: 'Definición del modelo de datos en centavos, feature flags, carpetas, flujo UX y riesgos de Google Play.', status: 'En Curso' },
              { num: 'Fase 1', title: 'Núcleo Gratuito (Gasto en <10s)', desc: 'Ingresos, gastos, categorías predefinidas, saldo total, resumen mensual y copia manual JSON.', status: 'Siguiente' },
              { num: 'Fase 2', title: 'Recordatorios & Pagos Recurrentes', desc: 'Notificaciones locales exactas en Android, marcar como pagado en 1 toque y soporte post-reinicio.', status: 'Pendiente' },
              { num: 'Fase 3', title: 'Pulido, 12 Testers & Google Play', desc: 'Pruebas de estrés, accesibilidad, paquete AAB, ficha de tienda y superación de los 14 días.', status: 'Pendiente' },
              { num: 'Fase 4', title: 'Plan Premium & Google Play Billing', desc: 'Cuentas múltiples, presupuestos por categoría, gráficos avanzados y suscripción integrada.', status: 'Pendiente' },
              { num: 'Fase 5', title: 'Plan Premium+ (Módulo Freelancer)', desc: 'Clientes, presupuestos, facturación y control de horas sin alterar el núcleo financiero.', status: 'Pendiente' },
            ].map((p, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {p.num}
                  </span>
                  <span className={`text-[10px] font-bold ${p.status === 'En Curso' ? 'text-sky-600' : 'text-slate-400'}`}>
                    {p.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{p.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION B: DATA MODEL */}
      {activeTab === 'model' && (
        <div className="mt-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" />
              (b) Modelo de Datos en Drift: Regla de Oro de Centavos Enteros
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>¿Por qué enteros en centavos y nunca doubles / float?:</strong> Los números en coma flotante sufren imprecisiones binarias en computación (ej: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">0.1 + 0.2 = 0.30000000000000004</code>). En finanzas, esto acumula discrepancias y descuadra saldos. Guardando <code className="text-sky-600 dark:text-sky-400 font-bold">amountInCents</code> como entero, el cálculo es 100% exacto y matemáticamente infalible.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
              <span className="text-sky-400 font-bold flex items-center gap-1.5">
                <Code2 className="w-4 h-4" /> Esquema Drift (Accounts, Categories, Transactions, Reminders)
              </span>
              <button
                onClick={() => copyCode(driftCode, 'drift_cents')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
              >
                {copiedSnippet === 'drift_cents' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'drift_cents' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="text-emerald-300 leading-relaxed overflow-x-auto max-h-[420px]">{driftCode}</pre>
          </div>
        </div>
      )}

      {/* SECTION C: FOLDERS */}
      {activeTab === 'folders' && (
        <div className="mt-5 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
              <span className="text-sky-400 font-bold flex items-center gap-1.5">
                <FolderTree className="w-4 h-4" /> Estructura Feature-First con Feature Flags y Plan Guard
              </span>
              <button
                onClick={() => copyCode(folderStructureText, 'folders')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
              >
                {copiedSnippet === 'folders' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'folders' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="text-slate-300 leading-relaxed overflow-x-auto">{folderStructureText}</pre>
          </div>
        </div>
      )}

      {/* SECTION D: FLOW (<10 SECONDS) */}
      {activeTab === 'flow' && (
        <div className="mt-5 space-y-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-black text-sm text-slate-900 dark:text-white mb-2">
              (d) Flujo UX: Registro de un Gasto en Menos de 10 Segundos
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              La principal causa de abandono en apps de finanzas es la fricción: pedir fecha, hora, cuenta, etiqueta, nota, comercio y foto del ticket.
              Nuestro flujo se reduce a <strong>3 toques obligatorios</strong>:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 uppercase">
                Toque 1 (1 seg)
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-xs">Pulsar botón "+" central</h4>
              <p className="text-slate-500 mt-1">Abre el teclado numérico gigante de inmediato, con foco listo sin esperar animación.</p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 uppercase">
                Toque 2 (3 seg)
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-xs">Escribir el importe</h4>
              <p className="text-slate-500 mt-1">Escribe "2500" con teclas grandes y cómodas. La fecha y la cuenta ya están preseleccionadas.</p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
                Toque 3 (2 seg)
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-xs">Tocar la categoría y listo</h4>
              <p className="text-slate-500 mt-1">Toca "Supermercado" o "Transporte". Se guarda automáticamente en SQLite con feedback háptico.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION E: 3 DIFFERENTIATORS */}
      {activeTab === 'differentials' && (
        <div className="mt-5 space-y-4 text-xs">
          <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800">
            <h3 className="font-black text-sm text-sky-950 dark:text-sky-200 mb-1">
              (e) 3 Ideas de Diferenciación Realistas para el Mercado
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              La mayoría de apps de finanzas cometen el error de ser "hojas de cálculo complejas para contadores". Aquí tienes 3 propuestas que destacan en Google Play:
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border-2 border-sky-500 bg-white dark:bg-slate-900 relative">
              <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-600 text-white uppercase">
                Recomendada por el Equipo
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Idea 1: "Cuánto puedo gastar hoy" (Disponible Diario Dinámico)
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                En lugar de abrumar con gráficos circulares o reportes de balances que nadie entiende, la pantalla principal te muestra un número claro y tranquilizador: <strong>"Hoy tenés $ 8.500 para gastar libremente"</strong>. Si gastas menos hoy, el remanente se suma automáticamente a los días restantes del mes. Si te pasas, recalcula el cupo diario para que nunca llegues a fin de mes en cero.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-sky-600" />
                Idea 2: "Modo Registro en 3 Segundos" con Categorías Frecuentes
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                La app aprende cuáles son tus 4 gastos más comunes según la hora del día (ej: café a la mañana, almuerzo al mediodía, transporte a la tarde) y los pone en primer plano. Abrís la app, ponés el número y en 1 toque salís.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Idea 3: "Radar de Vencimientos Sin Sorpresas"
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Cruza tus ingresos esperados con los recordatorios fijos (alquiler, tarjeta, internet, luz). Te muestra un semáforo visual de los próximos 30 días advirtiéndote antes de que te quedes sin saldo en la fecha de vencimiento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION F: RISKS */}
      {activeTab === 'risks' && (
        <div className="mt-5 space-y-4 text-xs">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
            <h3 className="font-black text-sm mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              (f) Matriz de Riesgos Principales (Técnicos & Google Play)
            </h3>
            <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
              Como equipo senior, te avisamos de los obstáculos reales antes de que ocurran:
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                ⚠️ 1. Políticas de Alarmas Exactas en Android 14 y 15 (Target API 35)
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Google Play prohíbe el uso libre del permiso <code className="text-rose-500 font-mono">SCHEDULE_EXACT_ALARM</code> a menos que la app sea un reloj despertador o calendario estricto. Si lo declaras sin justificar, Google rechazará la app.
                <br /><strong className="text-emerald-600">Solución del equipo:</strong> Usaremos <code className="text-emerald-500 font-mono">flutter_local_notifications</code> con <code className="text-emerald-500 font-mono">zonedSchedule</code> en modo inexacto admisible de batería o solicitando al usuario el permiso en tiempo de ejecución solo si activa recordatorios a una hora fija.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                ⚠️ 2. Alineación de Páginas de 16 KB en Android 15
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Google exige que todas las librerías C/C++ nativas de Android soporten tamaño de página de memoria de 16 KB.
                <br /><strong className="text-emerald-600">Solución del equipo:</strong> Drift usa SQLite estándar mediante <code className="text-emerald-500 font-mono">sqlite3_flutter_libs: ^0.5.24</code>, que ya incluye binarios compilados y verificados con 16 KB.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                ⚠️ 3. Requisito de los 12 Testers durante 14 Días (Cuenta Personal)
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Google no te dejará presionar "Publicar a Producción" si tus 12 testers desinstalan la app o no interactúan.
                <br /><strong className="text-emerald-600">Estrategia del equipo:</strong> Te daremos la plantilla de invitación y el paso a paso para crear un Grupo de Google con 15 a 18 personas de confianza (amigos, familiares, colegas) para cubrir posibles bajas.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                ⚠️ 4. Pérdida de Recordatorios al Reiniciar el Teléfono
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                En Android, cuando el usuario reinicia el dispositivo, el sistema operativo borra las alarmas programadas en memoria.
                <br /><strong className="text-emerald-600">Solución del equipo:</strong> Declararemos el receptor nativo <code className="text-emerald-500 font-mono">RECEIVE_BOOT_COMPLETED</code> para que la app lea automáticamente la base de datos Drift al encender el teléfono y reprograme todos los recordatorios activos en segundo plano.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
