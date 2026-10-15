import React, { useState } from 'react';
import { 
  FolderTree, 
  Database, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  Code2, 
  Terminal,
  Sparkles,
  AlertTriangle,
  FileText
} from 'lucide-react';

export const FlutterArchitectureDoc: React.FC = () => {
  const [section, setSection] = useState<'database' | 'folders' | 'ux' | 'playstore'>('database');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const driftCode = `// lib/core/database/tables/clients_table.dart
import 'package:drift/drift.dart';

class Clients extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get uuid => text().unique()();
  TextColumn get name => text().withLength(min: 1, max: 120)(); // Razón Social o Nombre
  TextColumn get company => text().nullable()();
  TextColumn get cuitCuil => text().nullable()(); // CUIT / CUIL / DNI argentino (ej. 20-34567890-9)
  TextColumn get ivaCondition => text().withDefault(const Constant('Consumidor Final'))(); // Monotributo, Resp. Inscripto, etc.
  TextColumn get phone => text().withLength(min: 3, max: 30)(); // Teléfono WhatsApp (+54 9 ...)
  TextColumn get email => text().nullable()();
  TextColumn get address => text().nullable()();
  TextColumn get city => text().nullable()();
  TextColumn get notes => text().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
  BoolColumn get isArchived => boolean().withDefault(const Constant(false))();
}

// lib/core/database/tables/quotes_table.dart
class Quotes extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get uuid => text().unique()();
  TextColumn get number => text().unique()(); // ej. '0001-00000014' o 'PRE-014'
  TextColumn get docType => text().withDefault(const Constant('Presupuesto'))(); // Presupuesto / Remito X
  IntColumn get clientId => integer().references(Clients, #id, onDelete: KeyAction.cascade)();
  DateTimeColumn get date => dateTime()();
  DateTimeColumn get validUntil => dateTime()();
  RealColumn get subtotal => real().withDefault(const Constant(0.0))();
  RealColumn get taxRate => real().withDefault(const Constant(0.0))(); // 0% para monotributo o 21% IVA
  RealColumn get taxAmount => real().withDefault(const Constant(0.0))();
  RealColumn get total => real().withDefault(const Constant(0.0))();
  TextColumn get status => text().withDefault(const Constant('borrador'))(); // borrador, enviado, aprobado, rechazado
  TextColumn get notes => text().nullable()();
  IntColumn get invoiceId => integer().nullable()(); // Clave foránea hacia Facturas cuando se aprueba
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

// lib/core/database/tables/quote_items_table.dart
class QuoteItems extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get quoteId => integer().references(Quotes, #id, onDelete: KeyAction.cascade)();
  TextColumn get description => text()();
  RealColumn get quantity => real().withDefault(const Constant(1.0))();
  RealColumn get unitPrice => real().withDefault(const Constant(0.0))();
  RealColumn get total => real()();
}

// lib/core/database/tables/invoices_table.dart
class Invoices extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get uuid => text().unique()();
  TextColumn get number => text().unique()(); // Formato AFIP: PuntoVenta - Número (ej. '0001-00000009')
  TextColumn get docType => text().withDefault(const Constant('Factura C'))(); // Factura C, Factura A, Factura B, Recibo X
  IntColumn get quoteId => integer().nullable().references(Quotes, #id, onDelete: KeyAction.setNull)();
  IntColumn get clientId => integer().references(Clients, #id, onDelete: KeyAction.restrict)();
  DateTimeColumn get issueDate => dateTime()();
  DateTimeColumn get dueDate => dateTime()();
  RealColumn get subtotal => real()();
  RealColumn get taxAmount => real().withDefault(const Constant(0.0))();
  RealColumn get total => real()();
  RealColumn get amountPaid => real().withDefault(const Constant(0.0))();
  TextColumn get status => text().withDefault(const Constant('pendiente'))(); // pendiente, parcial, cobrado, vencido
  TextColumn get paymentMethod => text().nullable()(); // Mercado Pago, CBU, Efectivo
  TextColumn get paymentNotes => text().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

// lib/core/database/tables/user_profile_table.dart
class UserProfiles extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get businessName => text()(); // ej. 'Mariano Electricidad & Redes'
  TextColumn get ownerName => text()();
  TextColumn get cuit => text()(); // ej. '20-39485721-3'
  TextColumn get ivaCondition => text().withDefault(const Constant('Monotributo'))();
  IntColumn get puntoVenta => integer().withDefault(const Constant(1))();
  TextColumn get cbuAlias => text()(); // ej. 'mariano.electricidad.mp'
  TextColumn get phone => text()();
  TextColumn get email => text()();
  TextColumn get address => text()();
  TextColumn get currency => text().withDefault(const Constant('ARS'))();
}`;

  const folderStructureText = `lib/
├── app.dart                   # MaterialApp, temas Material 3 minimalistas claros/oscuros
├── main.dart                  # Inicialización offline Drift + Riverpod
├── core/
│   ├── database/              # Esquema SQLite Drift relacional
│   │   ├── app_database.dart
│   │   ├── app_database.g.dart
│   │   └── tables/
│   │       ├── clients_table.dart
│   │       ├── quotes_table.dart
│   │       ├── quote_items_table.dart
│   │       ├── invoices_table.dart
│   │       └── user_profile_table.dart
│   ├── theme/                 # Diseño limpio minimalista (blanco, gris neutro y celeste argentino)
│   │   ├── app_theme.dart
│   │   └── color_palette.dart
│   └── utils/                 # Formateo ARS ($), CUIT, fechas argentinas y mensajes WhatsApp
│       ├── currency_formatter.dart
│       └── whatsapp_helper.dart
└── features/                  # FEATURE-FIRST: Módulos independientes
    ├── user_profile/          # Perfil comercial del usuario (CUIT, Alias Mercado Pago, etc.)
    ├── clients/               # CRM liviano: búsqueda CUIT/DNI, saldo pendiente, WhatsApp
    ├── quotes/                # Presupuestos / Remitos X con ítems y conversión directa
    ├── invoices/              # Facturación C/A/B y Cobranzas con semáforo de pagos
    └── backup/                # Copia de seguridad local JSON (SAF Android)`;

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> ESQUEMA DRIFT • ADAPTADO A ARGENTINA
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Base de Datos SQLite & Arquitectura Limpia
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1">
            Diseño relacional robusto con Claves Foráneas, campos AFIP (CUIT, Factura C/A/B, Condición IVA, Alias) y comparativa técnica frente a Hive e Isar.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setSection('database')}
            className={`px-3 py-2 rounded-lg transition-all ${
              section === 'database'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Tablas Drift & Comparativa
          </button>
          <button
            onClick={() => setSection('folders')}
            className={`px-3 py-2 rounded-lg transition-all ${
              section === 'folders'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Estructura Feature-First
          </button>
          <button
            onClick={() => setSection('ux')}
            className={`px-3 py-2 rounded-lg transition-all ${
              section === 'ux'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Flujo UX Minimalista
          </button>
          <button
            onClick={() => setSection('playstore')}
            className={`px-3 py-2 rounded-lg transition-all ${
              section === 'playstore'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Google Play & 12 Testers
          </button>
        </div>
      </div>

      {/* SECTION: DATABASE */}
      {section === 'database' && (
        <div className="mt-6 space-y-6">
          {/* Detailed Justification Card: Drift vs Hive vs Isar */}
          <div className="bg-slate-50 dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              ¿Por qué Drift frente a Hive o Isar? (Justificación Arquitectónica)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              En una aplicación de gestión contable, presupuestos y dinero, la fiabilidad de los datos y el cumplimiento de las políticas de Google Play son innegociables.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Drift */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-sky-500 shadow-sm relative">
                <span className="absolute -top-2.5 right-3 bg-sky-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Elección Definitiva
                </span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-2 text-sky-600 dark:text-sky-400">
                  Drift (SQLite Relacional)
                </h4>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Integridad referencial ACID:</strong> Si borras un presupuesto, sus ítems se eliminan en cascada; si un cliente tiene facturas, la base de datos impide su borrado accidental (<code className="font-mono text-[11px] text-sky-700 dark:text-sky-300">KeyAction.restrict</code>).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>100% C-Native SQLite:</strong> No depende de binarios propietarios experimentales; utiliza el SQLite probado del sistema operativo.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Migraciones seguras:</strong> Permite agregar columnas (ej. retención de ingresos brutos) sin perder datos existentes.</span>
                  </li>
                </ul>
              </div>

              {/* Hive */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm mb-2">
                  Hive (Key-Value NoSQL)
                </h4>
                <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Sin relaciones relacionales:</strong> Es un almacén clave-valor plano. No admite Foreign Keys ni operaciones JOIN.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Carga todo en memoria RAM:</strong> Con cientos de presupuestos y clientes, satura la memoria del teléfono en Android.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Riesgo de corrupción de cajas si la app se cierra bruscamente en segundo plano.</span>
                  </li>
                </ul>
              </div>

              {/* Isar */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm mb-2">
                  Isar Database
                </h4>
                <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">⚠️</span>
                    <span><strong>Peligro crítico en Google Play:</strong> En Android 15 (Target API 35) Google exige soporte para páginas de 16 KB en librerías nativas. Isar ha sufrido problemas graves de compatibilidad binaria NDK.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">⚠️</span>
                    <span><strong>Mantenimiento discontinuo:</strong> Largos periodos sin actualizaciones estables de su creador.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* DRIFT SCHEMA CODE BLOCK */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-2">
                <Code2 className="w-4 h-4" /> Esquema Completo Drift en Dart (Tablas AFIP & Foreign Keys)
              </span>
              <button
                onClick={() => copyCode(driftCode, 'drift')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                {copiedSnippet === 'drift' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSnippet === 'drift' ? 'Copiado' : 'Copiar Código'}</span>
              </button>
            </div>
            <pre className="pt-4 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto max-h-[500px]">
              {driftCode}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION: FOLDERS */}
      {section === 'folders' && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-300 mb-3">
              <span className="font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" /> Árbol de Carpetas (Clean Architecture Feature-First)
              </span>
              <button
                onClick={() => copyCode(folderStructureText, 'folders')}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
              >
                {copiedSnippet === 'folders' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'folders' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="text-slate-300 leading-relaxed overflow-x-auto">{folderStructureText}</pre>
          </div>
        </div>
      )}

      {/* SECTION: UX FLOW */}
      {section === 'ux' && (
        <div className="mt-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              Flujo Minimalista: Una Acción Principal por Pantalla
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">1. Clientes</span>
                <p className="text-slate-600 dark:text-slate-400">Directorio con CUIT/CUIL, buscador y saldo pendiente.</p>
                <div className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
                  Acción principal: <strong>+ Nuevo Presupuesto</strong> para este cliente.
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">2. Presupuestos</span>
                <p className="text-slate-600 dark:text-slate-400">Cálculo de ítems en vivo en Pesos ($ ARS).</p>
                <div className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
                  Acción principal: <strong>Convertir a Factura C/A</strong> o enviar por WhatsApp con Alias CBU.
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">3. Cobranzas</span>
                <p className="text-slate-600 dark:text-slate-400">Control de saldo en mano o por transferencia.</p>
                <div className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
                  Acción principal: <strong>Registrar Cobro</strong> parcial o total con método de pago.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PLAY STORE */}
      {section === 'playstore' && (
        <div className="mt-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Requisitos de Publicación para Cuentas Personales en Google Play
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Para cuentas personales registradas en Google Play Console después de nov. 2023:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 font-medium">
              <li><strong>Prueba cerrada:</strong> Invitar a 12 testers reales para que descarguen y mantengan la app durante 14 días ininterrumpidos.</li>
              <li><strong>Formulario de Seguridad de los Datos:</strong> Declarar que la app es 100% offline, sin servidores y sin recopilación de datos de terceros.</li>
              <li><strong>Target SDK:</strong> Cumplir con Android 15 (API 35) y arquitectura nativa sin permisos intrusivos.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
