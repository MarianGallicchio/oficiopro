import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, HelpCircle, BellRing, LogOut, ShieldCheck, Info,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useAppData } from './hooks/useAppData';
import { useAlarmEngine, requestNotificationPermission } from './hooks/useAlarmEngine';
import { AuthScreen } from './components/AuthScreen';
import { MobileSimulator } from './components/MobileSimulator';
import { AlarmCenter } from './components/AlarmCenter';
import { UserHelpModal } from './components/UserHelpModal';
import { UserAppSettings } from './types';

const THEME_AURORA: Record<UserAppSettings['theme'], string> = {
  minimal: '',           // .aurora-bg por defecto
  sakura: 'aurora-sakura',
  cyberpunk: 'aurora-cyberpunk',
  golden: 'aurora-golden',
  aurora: 'aurora-aurora',
  nocturn: 'aurora-nocturn',
};

/** App ya autenticada: shell + motor de alarmas + cuerpo de la app. */
function AppShell() {
  const { user, signOut } = useAuth();
  const {
    db, updateSettings, addTransaction, payReminder,
    addReminder, updateReminder, deleteReminder, addSavingsDeposit,
    addClient, addQuote, convertQuoteToInvoice,
    registerInvoicePayment, toggleTimer, billTimeEntry,
    addAgendaEvent, deleteAgendaEvent,
  } = useAppData(user);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [permissionAskedHint, setPermissionAskedHint] = useState(false);

  // db es null mientras carga; els hooks de alarma requieren datos
  const alarmSource = db
    ? { reminders: db.reminders, agendaEvents: db.agendaEvents, invoices: db.invoices, transactions: db.transactions, settings: db.settings }
    : null;

  const {
    alarms, dismissAlarm, snoozeAlarm, fireTestAlarm,
  } = useAlarmEngine(alarmSource, permission);

  useEffect(() => {
    requestNotificationPermission().then((p) => {
      setPermission(p);
      if (p !== 'granted') setPermissionAskedHint(true);
    });
  }, []);

  const [toast, setToast] = useState<string | null>(null);
  const toastReappear = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleSnooze = useCallback((alarm: { key: string }, minutes: number) => {
    dismissAlarm(alarm.key);
    setTimeout(() => {
      toastReappear(`⏱ Recordatorio pospuesto ${minutes} min. Te avisamos de nuevo.`);
    }, 300);
  }, [dismissAlarm]);

  if (!db) {
    // Esqueletos de carga mientras se restaura la base por usuario
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 aurora-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white grid place-items-center shadow-xl shadow-sky-500/30"
          >
            <Wallet className="w-7 h-7" />
          </motion.div>
          <div className="w-40 h-2 rounded-full op-skeleton" />
          <p className="text-[11px] text-slate-500">Restaurando tus datos…</p>
        </div>
      </div>
    );
  }

  const dark = db.settings.theme === 'cyberpunk';

  return (
    <div className={THEME_AURORA[db.settings.theme]}>
      {/* Fondo aurora permanente de la app */}
      <div className={`${dark ? 'dark' : ''} min-h-screen relative flex flex-col ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
        <div className="absolute inset-0 aurora-bg pointer-events-none" aria-hidden="true" />

        {/* ===== BARRA SUPERIOR ===== */}
        <header className="relative z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white grid place-items-center shadow-md shadow-sky-500/25 shrink-0">
                <Wallet className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-black tracking-tight text-slate-900 dark:text-white text-sm leading-none truncate">
                  Oficio<span className="text-sky-600 dark:text-sky-400">Pro</span>
                </h1>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.provider === 'demo' ? 'Modo demo (datos locales)' : user?.displayName}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Alertas activas */}
              {alarms.length > 0 && (
                <motion.button
                  animate={{ rotate: [0, -10, 10, -6, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 3 }}
                  className="relative p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                  title={`${alarms.length} alertas activas`}
                >
                  <BellRing className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[8px] rounded-full bg-rose-600 text-white grid place-items-center font-black">
                    {alarms.length}
                  </span>
                </motion.button>
              )}

              <button
                onClick={fireTestAlarm}
                className="hidden sm:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Probar alarma de ejemplo"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsHelpOpen(true)}
                className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900 transition"
                title="Centro de ayuda"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Usuario */}
              <button
                onClick={() => { signOut(); }}
                className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                title={user?.provider === 'demo' ? 'Salir del modo demo' : `Cerrar sesión (${user?.email ?? ''})`}
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white text-[9px] font-black grid place-items-center">
                    {(user?.displayName || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
                <LogOut className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>
        </header>

        {/* ===== CUERPO ===== */}
        <main className="relative z-10 flex-1 min-h-0 flex justify-center overflow-hidden">
          <MobileSimulator
            settings={db.settings}
            accounts={db.accounts}
            categories={db.categories}
            transactions={db.transactions}
            reminders={db.reminders}
            savingsGoals={db.savingsGoals}
            clients={db.clients}
            quotes={db.quotes}
            invoices={db.invoices}
            timeEntries={db.timeEntries}
            agendaEvents={db.agendaEvents}
            onAddTransaction={addTransaction}
            onPayReminder={payReminder}
            onUpdateSettings={(s) => updateSettings(s)}
            onAddReminder={addReminder}
            onUpdateReminder={updateReminder}
            onDeleteReminder={deleteReminder}
            onAddEvent={addAgendaEvent}
            onDeleteEvent={deleteAgendaEvent}
            onAddSavingsDeposit={addSavingsDeposit}
            onAddClient={addClient}
            onAddQuote={addQuote}
            onConvertQuoteToInvoice={convertQuoteToInvoice}
            onRegisterInvoicePayment={registerInvoicePayment}
            onToggleTimer={toggleTimer}
            onBillTimeEntry={billTimeEntry}
          />
        </main>

        {/* ===== CENTRO DE ALERTAS ===== */}
        <AlarmCenter
          alarms={alarms}
          currency={db.settings.currency}
          onDismiss={dismissAlarm}
          onSnooze={(a, minutes) => handleSnooze(a, minutes)}
        />

        {/* Toast informativo */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[70] px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold shadow-xl"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aviso de permiso de notificaciones */}
        <AnimatePresence>
          {permissionAskedHint && permission !== 'unsupported' && alarms.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed left-3 right-3 bottom-16 sm:right-auto sm:w-80 z-[60] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 flex items-start gap-2.5"
            >
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-[10px] text-slate-600 dark:text-slate-300">
                <p className="font-black text-slate-900 dark:text-white mb-0.5">Armá las alarmas al 100%</p>
                Permití notificaciones del navegador cuando te lo pida para recibir los avisos aunque otra pestaña esté abierta.
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={async () => { setPermissionAskedHint(false); setPermission(await requestNotificationPermission()); }}
                    className="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black transition"
                  >
                    Activar permiso
                  </button>
                  <button
                    onClick={() => setPermissionAskedHint(false)}
                    className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-500"
                  >
                    Ahora no
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ayuda completa */}
        <UserHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </div>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 aurora-bg flex items-center justify-center">
        <div className="w-48 h-2 rounded-full op-skeleton" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
