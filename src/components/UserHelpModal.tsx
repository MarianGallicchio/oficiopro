import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  Zap, 
  PiggyBank, 
  Briefcase, 
  Bell, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  Search, 
  Smartphone,
  Wallet,
  Clock,
  Send
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UserHelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTopic, setActiveTopic] = useState<'quick_start' | 'savings' | 'commercial' | 'reminders' | 'faq'>('quick_start');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Centro de Ayuda & Guía del Usuario
              </h2>
              <p className="text-xs text-slate-500">
                Todo lo que necesitas saber para dominar la app sin complicaciones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 pt-2 gap-1 overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { id: 'quick_start', label: 'Gasto en <10s', icon: Zap },
            { id: 'savings', label: 'Metas & Ahorro', icon: PiggyBank },
            { id: 'commercial', label: 'Uso Comercial', icon: Briefcase },
            { id: 'reminders', label: 'Avisos & Pagos', icon: Bell },
            { id: 'faq', label: 'Preguntas Frecuentes', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTopic === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTopic(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/40 rounded-t-lg'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
          
          {/* TAB 1: QUICK START (< 10 SECONDS) */}
          {activeTopic === 'quick_start' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="font-black text-amber-900 dark:text-amber-200 text-sm block mb-1">
                  ⚡ La Regla de los 3 Toques (Cero Fricción)
                </span>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  El 90% de las apps financieras fracasan porque el usuario tiene que elegir cuenta, fecha, hora, subcategoría y nota. Aquí se anota un gasto en la caja del supermercado en 3 toques exactos:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center">1</div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Tocá "+ Gasto Rápido"</h4>
                  <p className="text-[11px] text-slate-500">
                    El botón flotante siempre accesible abre el teclado numérico de pantalla completa de inmediato.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center">2</div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Escribí el importe</h4>
                  <p className="text-[11px] text-slate-500">
                    Botones grandes tipo calculadora (ej. "3", "5", "0", "0" para $3.500).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center">3</div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Tocá la categoría</h4>
                  <p className="text-[11px] text-slate-500">
                    Al tocar "Alimentos" o "Nafta", se guarda automáticamente y el modal se cierra. ¡Listo en 4 segundos!
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px]">
                  <strong>Dato Clave:</strong> No necesitas internet. Los datos se guardan al instante en la memoria SQLite de tu teléfono.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: SAVINGS GOALS */}
          {activeTopic === 'savings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="font-black text-emerald-900 dark:text-emerald-200 text-sm block mb-1">
                  🐷 Gestión Individual de Ahorros: ¿Cómo cumplir tus metas?
                </span>
                <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  El ahorro no debe ser "lo que sobra al final del mes", sino un apartado intencional al inicio.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">1. Crea Metas Claras con Fecha</h4>
                  <p className="text-[11px] text-slate-500">
                    Crea metas como "Fondo de Emergencia" ($ 600.000) o "Vacaciones". La app calcula el porcentaje alcanzado y te muestra cuánto falta para completarla.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">2. Haz Aportes Rápidos</h4>
                  <p className="text-[11px] text-slate-500">
                    Desde la pestaña "Ahorros", tocá "Aportar a Meta". El monto se suma al progreso de la meta y se registra automáticamente como un movimiento seguro.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">3. Disponible Diario Inteligente</h4>
                  <p className="text-[11px] text-slate-500">
                    El HUD te muestra cuánto puedes gastar por día hoy. Si un día no gastas nada, tu disponible diario de mañana aumentará automáticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMERCIAL & FREELANCE */}
          {activeTopic === 'commercial' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <span className="font-black text-sky-900 dark:text-sky-200 text-sm block mb-1">
                  💼 Modo Comercial: Para Freelancers y Oficios
                </span>
                <p className="text-sky-800 dark:text-sky-300 leading-relaxed">
                  Activa el interruptor en el HUD superior para alternar entre tu gestión personal y tu actividad comercial independiente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Presupuestos Rápidos</h4>
                  <p className="text-[11px] text-slate-500">
                    Arma presupuestos con ítems, cantidades y precio unitario. Con 1 toque genera el mensaje formal de WhatsApp para enviarlo al cliente.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Facturación & Cobros</h4>
                  <p className="text-[11px] text-slate-500">
                    Controla quién te debe dinero. Envía recordatorios de cobro con tu Alias CBU / Mercado Pago con un solo clic.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Control de Horas en Vivo</h4>
                  <p className="text-[11px] text-slate-500">
                    Inicia el cronómetro cuando empieces a trabajar en un proyecto. Al terminar, toca "Facturar Horas" y calcula el importe exacto según tu valor hora.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Clientes con CUIT / WhatsApp</h4>
                  <p className="text-[11px] text-slate-500">
                    Ficha rápida de clientes adaptada a Argentina (Condición frente al IVA: Monotributo, Responsable Inscripto).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REMINDERS & DUE DATES */}
          {activeTopic === 'reminders' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <span className="font-black text-purple-900 dark:text-purple-200 text-sm block mb-1">
                  🔔 Radar de Vencimientos: Cero Sorpresas
                </span>
                <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                  Nunca más pagues recargos por mora en Monotributo, tarjetas de crédito o servicios domiciliarios.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                  <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">Avisos con Días de Anticipación</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      La app te avisa 3 días antes y el mismo día del vencimiento a la hora exacta que elijas.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">1 Toque: "Marcar Pagado" crea el Gasto</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      No necesitas cargar el gasto dos veces. Al marcar pagado un aviso, se registra el gasto en centavos exactos en tu historial.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ */}
          {activeTopic === 'faq' && (
            <div className="space-y-3">
              {[
                {
                  q: '¿Mis datos viajan a algún servidor de internet?',
                  a: 'No. La app es 100% offline-first. Los datos viven exclusivamente en la base de datos SQLite en tu dispositivo.',
                },
                {
                  q: '¿Cómo hago una copia de seguridad por si cambio de teléfono?',
                  a: 'En la pestaña "Ajustes", tocá "Exportar Copia de Seguridad". Descargarás un archivo seguro .json que puedes enviar a tu email o Google Drive y restaurarlo cuando quieras.',
                },
                {
                  q: '¿Por qué todos los cálculos se manejan en centavos enteros?',
                  a: 'Para evitar el clásico error de los números con decimales (0.1 + 0.2 = 0.30000000000000004). En esta app el dinero siempre cuadra al centavo exacto.',
                },
                {
                  q: '¿Cómo funciona la publicación en Google Play?',
                  a: 'La arquitectura está lista para cumplir con Target API 35 (Android 15), paquete en formato AAB y las políticas de privacidad y datos de Google Play.',
                },
              ].map((faq, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
                    {faq.q}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-5">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">
            ¿Tienes dudas técnicas? Consulta la pestaña <strong>"Código Base Flutter"</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-xs transition"
          >
            Entendido, volver a la app
          </button>
        </div>
      </div>
    </div>
  );
};
