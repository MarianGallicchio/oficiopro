import React, { useState } from 'react';
import { 
  ArrowRight, 
  Zap, 
  Users, 
  BarChart3, 
  Plus, 
  Check, 
  Smartphone, 
  Sparkles, 
  Clock, 
  Layers, 
  Eye 
} from 'lucide-react';

export const NavigationFlowDiagram: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<'expense' | 'clients' | 'reports' | 'allowance'>('expense');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5 text-slate-800 dark:text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold mb-1">
            <Zap className="w-3.5 h-3.5" /> ARQUITECTURA DE FLUJO MINIMALISTA
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Diagrama de Navegación & Mínimos Clics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Optimizada para registrar cualquier transacción en menos de 10 segundos y cero fricción cognitiva.
          </p>
        </div>

        {/* Action Selectors */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setSelectedAction('expense')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedAction === 'expense' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Gasto Rápido (3 Clics)
          </button>
          <button
            onClick={() => setSelectedAction('allowance')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedAction === 'allowance' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Disponible Hoy (0 Clics)
          </button>
          <button
            onClick={() => setSelectedAction('clients')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedAction === 'clients' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Clientes (2 Clics)
          </button>
          <button
            onClick={() => setSelectedAction('reports')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedAction === 'reports' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Reportes (1 Clic)
          </button>
        </div>
      </div>

      {/* Visual Wireflow Diagram */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="min-w-[680px] grid grid-cols-4 gap-4 relative items-center">
          {/* Node 1: Dashboard */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-sky-500 shadow-sm relative">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 uppercase">
              PANTALLA 1 (CORE)
            </span>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">Dashboard Principal</h4>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <li>• Banner "Cuánto podés gastar hoy"</li>
              <li>• Saldo real en billetera</li>
              <li>• Últimos 5 movimientos</li>
              <li>• Alerta de pagos próximos</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-sky-600 dark:text-sky-400 text-[11px] flex items-center justify-between">
              <span>FAB Central "+"</span>
              <span className="text-slate-400">0 clics de entrada</span>
            </div>
          </div>

          {/* Node 2: Quick Expense Entry */}
          <div className={`p-4 bg-white dark:bg-slate-900 rounded-xl border transition shadow-sm ${
            selectedAction === 'expense' ? 'border-2 border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 uppercase">
              PANTALLA 2 (OVERLAY)
            </span>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">Registro Ultrarrápido</h4>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <li>• Teclado numérico gigante</li>
              <li>• Importe predeterminado en $</li>
              <li>• Grid de 6 categorías comunes</li>
              <li>• <strong>Auto-guardado sin "Aceptar"</strong></li>
            </ul>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-rose-600 dark:text-rose-400 text-[11px] flex items-center justify-between">
              <span>Tiempo total:</span>
              <span>4 a 6 segundos</span>
            </div>
          </div>

          {/* Node 3: Clients Management (Premium+) */}
          <div className={`p-4 bg-white dark:bg-slate-900 rounded-xl border transition shadow-sm ${
            selectedAction === 'clients' ? 'border-2 border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 uppercase">
              PANTALLA 3 (PREMIUM+)
            </span>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">Gestión de Clientes</h4>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <li>• Buscador por nombre o CUIT</li>
              <li>• Ficha con saldo adeudado</li>
              <li>• Botón directo WhatsApp (+54 9)</li>
              <li>• Generar cotización en 1 toque</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-sky-600 dark:text-sky-400 text-[11px] flex items-center justify-between">
              <span>Acceso directo:</span>
              <span>Tab Bar inferior</span>
            </div>
          </div>

          {/* Node 4: Reports & Analytics */}
          <div className={`p-4 bg-white dark:bg-slate-900 rounded-xl border transition shadow-sm ${
            selectedAction === 'reports' ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
              PANTALLA 4 (ANALYTICS)
            </span>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">Reportes & Desglose</h4>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <li>• Gráfico mensual comparativo</li>
              <li>• Desglose por categoría</li>
              <li>• Presupuestos asignados</li>
              <li>• Exportar a PDF / CSV</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center justify-between">
              <span>Acceso:</span>
              <span>1 Clic desde menú</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step Breakdown of Selected Action */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
        {selectedAction === 'expense' && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Flujo Crítico: Cargar un Gasto en 3 Clics (&lt; 10 Segundos)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-black text-sky-600 text-xs">Paso 1 (Clic 1):</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">Tocas el botón flotante "+ Gasto Rápido" en la pantalla de inicio.</p>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-black text-sky-600 text-xs">Paso 2 (Clic 2):</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">Digitas el importe en el teclado numérico de alta visibilidad (ej: 3500).</p>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-black text-emerald-600 text-xs">Paso 3 (Clic 3):</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">Tocas la categoría ("Super"). La app guarda en Drift SQLite y se cierra sola.</p>
              </div>
            </div>
          </div>
        )}

        {selectedAction === 'allowance' && (
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-600" />
              Saber Cuánto Puedo Gastar Hoy: 0 Clics
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Al abrir la app, el banner superior muestra de inmediato tu disponible diario calculado en tiempo real dividiendo el presupuesto restante por los días que faltan para terminar el mes. No requiere navegar a ninguna pantalla secundaria.
            </p>
          </div>
        )}

        {selectedAction === 'clients' && (
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              Gestión de Clientes & Cobranzas (Módulo Premium+): 2 Clics
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              1 Clic en la pestaña "Clientes" ➔ 1 Clic en el cliente para abrir el diálogo de WhatsApp con el saldo pendiente y el Alias de Mercado Pago precargado.
            </p>
          </div>
        )}

        {selectedAction === 'reports' && (
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Reportes & Resumen Mensual: 1 Clic
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Acceso instantáneo desde el menú de inicio para ver la proporción de gastos del mes en curso y exportar a formato CSV o PDF.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
