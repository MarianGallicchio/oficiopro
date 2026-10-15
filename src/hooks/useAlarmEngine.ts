import { useCallback, useEffect, useRef, useState } from 'react';
import { AgendaEvent, Reminder, Invoice, UserAppSettings, Transaction } from '../types';
import { formatMoney } from '../utils/formatters';

export interface ActiveAlarm {
  key: string; // id único del disparo (dedup)
  kind: 'reminder' | 'event' | 'invoice' | 'test' | 'goal';
  id: string;
  title: string;
  message: string;
  amountInCents?: number;
  urgent: boolean;
}

interface AlarmSource {
  reminders: Reminder[];
  agendaEvents: AgendaEvent[];
  invoices: Invoice[];
  settings: UserAppSettings;
  transactions: Transaction[];
}

const FIRED_KEY = 'op_fired_alarm_keys';
const ALARM_POLL_MS = 20_000;

function loadFired(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) || '[]') as string[];
  } catch { return []; }
}

function saveFired(keys: string[]) {
  // Conserva solo la semana actual para no crecer infinito
  localStorage.setItem(FIRED_KEY, JSON.stringify(keys.slice(-400)));
}

/** Beep de alarma con WebAudio (sin assets externos). */
function playAlarmBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === 0 ? 880 : 660;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.35);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.35 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.35 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.35);
      osc.stop(ctx.currentTime + i * 0.35 + 0.32);
    }
    setTimeout(() => ctx.close().catch(() => {}), 1000);
  } catch { /* silencio */ }
}

function nextOccurrence(rem: Reminder): Date | null {
  const base = new Date(`${rem.dueDate}T${rem.dueTime}:00`);
  if (rem.frequency === 'once') return base;
  const now = new Date();
  if (base >= now) return base;
  // Proyecta la próxima repetición (día/mes/año exacto)
  let next = new Date(base);
  while (next < now) {
    switch (rem.frequency) {
      case 'daily': next.setDate(next.getDate() + 1); break;
      case 'weekly': next.setDate(next.getDate() + 7); break;
      case 'monthly': next.setMonth(next.getMonth() + 1); break;
      case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
    }
  }
  return next;
}

/**
 * Motor de alarmas. Devuelve la pila de alarmas activas + acciones,
 * y revisa cada 20 s los recordatorios/eventos/facturas próximos.
 */
export function useAlarmEngine(source: AlarmSource | null, permission: NotificationPermission | 'unsupported') {
  const [alarms, setAlarms] = useState<ActiveAlarm[]>([]);
  const lastPollRef = useRef<number>(0);
  const firedRef = useRef<Set<string>>(new Set());

  // Limpia dedup al cambiar silenciosamente entre sesiones
  useEffect(() => {
    if (source) firedRef.current = new Set(loadFired());
  }, [source?.settings.dailyReminderTime, source?.reminders.length, source?.agendaEvents.length]);

  const fireAlarm = useCallback((alarm: ActiveAlarm) => {
    // Dedup por clave
    if (firedRef.current.has(alarm.key)) return;
    firedRef.current.add(alarm.key);
    saveFired([...firedRef.current]);

    setAlarms((prev) => [alarm, ...prev].slice(0, 5));

    // Vibración + sonido
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
    playAlarmBeep();

    // Notificación del sistema
    if (permission === 'granted') {
      try {
        new Notification(alarm.title, {
          body: alarm.message,
          tag: alarm.key,
          icon: undefined,
        });
      } catch { /* algunos navegadores no permiten sin SW */ }
    }
  }, [permission]);

  const scan = useCallback((src: AlarmSource) => {
    const now = new Date();

    const GRACE_MS = 20 * 60_000; // sigue sonando hasta 20 min después de vencer

    // Recordatorios de pago
    for (const rem of src.reminders) {
      if (rem.isPaid) continue;
      const lead = (rem.alarmMinutes ?? 30) * 60_000;
      const due = rem.snoozedUntil ? new Date(rem.snoozedUntil) : nextOccurrence(rem);
      if (!due) continue;
      const fireAt = new Date(due.getTime() - lead);
      const inWindow = now >= fireAt && now.getTime() - due.getTime() < GRACE_MS;
      if (!inWindow) continue;
      fireAlarm({
        key: `rem-${rem.id}-${rem.dueDate}-${rem.snoozedUntil ? 'snoozed' : 'due'}`,
        kind: 'reminder',
        id: rem.id,
        title: `⏰ Vence: ${rem.title}`,
        message: `Vence a las ${rem.dueTime} · ${formatMoney(rem.amountInCents, src.settings.currency)}`,
        amountInCents: rem.amountInCents,
        urgent: now >= due,
      });
    }

    // Agenda
    for (const evt of src.agendaEvents) {
      if (!evt.date) continue;
      const lead = (evt.reminderMinutes ?? 30) * 60_000;
      const start = new Date(`${evt.date}T${evt.time || '09:00'}:00`);
      const fireAt = new Date(start.getTime() - lead);
      if (now >= fireAt && now.getTime() - start.getTime() < 60 * 60_000) {
        fireAlarm({
          key: `evt-${evt.id}-${evt.date}`,
          kind: 'event',
          id: evt.id,
          title: `📅 Próximo: ${evt.title}`,
          message: evt.time ? `Te espera a las ${evt.time} hs${evt.notes ? ' · ' + evt.notes : ''}` : 'Todo el día',
          urgent: now >= start,
        });
      }
    }

    // Cobros pendientes (facturas vencidas o vencen en 48 h)
    for (const inv of src.invoices) {
      if (inv.status === 'paid') continue;
      const due = new Date(`${inv.dueDate}T09:00:00`);
      const dueSoon = due.getTime() - now.getTime() > 0 && due.getTime() - now.getTime() < 48 * 3600_000;
      const overdue = now > due && now.getTime() - due.getTime() < 7 * 24 * 3600_000;
      if (!dueSoon && !overdue) continue;
      fireAlarm({
        key: `inv-${inv.id}-${inv.dueDate}-${inv.status}`,
        kind: 'invoice',
        id: inv.id,
        title: overdue ? `💸 Cobro vencido: ${inv.clientName}` : `💳 Cobro próximo: ${inv.clientName}`,
        message: `Saldo ${formatMoney(inv.totalInCents - inv.paidInCents, src.settings.currency)} · ${inv.docType} N° ${inv.number}`,
        amountInCents: inv.totalInCents - inv.paidInCents,
        urgent: overdue,
      });
    }

    // Objetivo de balance neto mensual: alerta única por mes si corre por debajo
    const netGoal = src.settings.monthlyNetGoalInCents ?? 0;
    if (netGoal > 0) {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthTxs = src.transactions.filter((t) => t.date.startsWith(monthPrefix));
      const monthIncome = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amountInCents, 0);
      const monthExpense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amountInCents, 0);
      const monthNet = monthIncome - monthExpense;
      if (monthNet < netGoal) {
        fireAlarm({
          key: `goal-${monthPrefix}`,
          kind: 'goal',
          id: 'net-goal',
          title: `🎯 Bajo el objetivo mensual`,
          message: `Neto del mes: ${formatMoney(monthNet, src.settings.currency)} · objetivo: ${formatMoney(netGoal, src.settings.currency)}`,
          amountInCents: netGoal - monthNet,
          urgent: monthNet < 0,
        });
      }
    }
  }, [fireAlarm]);

  useEffect(() => {
    if (!source) return;
    const run = () => {
      scan(source);
      lastPollRef.current = Date.now();
    };
    run();
    const iv = setInterval(run, ALARM_POLL_MS);
    return () => clearInterval(iv);
  }, [source, scan]);

  const dismissAlarm = useCallback((key: string) => {
    setAlarms((prev) => prev.filter((a) => a.key !== key));
  }, []);

  const snoozeAlarm = useCallback((key: string, minutes: number, rebuild: (a: ActiveAlarm) => ActiveAlarm | null) => {
    setAlarms((prev) => prev.filter((a) => a.key !== key));
    const t = setTimeout(() => {
      setAlarms((prev) => {
        const rebuilt = rebuild({ ...prev[0], key: `${key}snooze-${Date.now()}` } as ActiveAlarm);
        return rebuilt ? [rebuilt, ...prev] : prev;
      });
    }, minutes * 60_000);
    return () => clearTimeout(t);
  }, []);

  const fireTestAlarm = useCallback(() => {
    fireAlarm({
      key: `test-${Date.now()}`,
      kind: 'test',
      id: 'test',
      title: '🔔 Alarma de prueba',
      message: 'Así se ve y suena una alerta de OficioPro. Todo listo.',
      urgent: false,
    });
  }, [fireAlarm]);

  /** Suelta la dedup para re-armar alarmas si el usuario lo pide. */
  const rearm = useCallback(() => {
    firedRef.current = new Set();
    saveFired([]);
  }, []);

  return { alarms, dismissAlarm, snoozeAlarm, fireTestAlarm, rearm };
}

/** Pide permiso de notificaciones del navegador de forma segura. */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  try {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  } catch {
    return 'denied';
  }
}
