import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, CalendarClock, Receipt, X, Clock4, CheckCircle2, Target } from 'lucide-react';
import { ActiveAlarm } from '../hooks/useAlarmEngine';
import { CurrencyConfig } from '../types';

interface Props {
  alarms: ActiveAlarm[];
  currency?: CurrencyConfig;
  onDismiss: (key: string) => void;
  onSnooze: (alarm: ActiveAlarm, minutes: number) => void;
}

const KIND_ICON = {
  reminder: BellRing,
  event: CalendarClock,
  invoice: Receipt,
  goal: Target,
  test: CheckCircle2,
};

const KIND_STYLE = {
  reminder: 'border-amber-300 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/70 dark:to-amber-900/40',
  event: 'border-sky-300 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950/70 dark:to-sky-900/40',
  invoice: 'border-rose-300 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/70 dark:to-rose-900/40',
  goal: 'border-violet-300 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/70 dark:to-violet-900/40',
  test: 'border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/70 dark:to-emerald-900/40',
};

const KIND_TEXT = {
  reminder: 'text-amber-700 dark:text-amber-300',
  event: 'text-sky-700 dark:text-sky-300',
  invoice: 'text-rose-700 dark:text-rose-300',
  goal: 'text-violet-700 dark:text-violet-300',
  test: 'text-emerald-700 dark:text-emerald-300',
};

export const AlarmCenter: React.FC<Props> = ({ alarms, currency, onDismiss, onSnooze }) => {
  return (
    <div className="fixed top-16 right-3 left-3 sm:left-auto sm:w-96 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {alarms.map((alarm) => {
          const Icon = KIND_ICON[alarm.kind];
          return (
            <motion.div
              key={alarm.key}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`pointer-events-auto rounded-2xl border shadow-xl backdrop-blur-md p-3.5 ${KIND_STYLE[alarm.kind]}`}
              role="alert"
            >
              <div className="flex items-start gap-2.5">
                <motion.span
                  animate={{ rotate: [0, -14, 14, -8, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 2.2, duration: 0.7 }}
                  className={`mt-0.5 shrink-0 ${KIND_TEXT[alarm.kind]}`}
                >
                  <Icon className="w-5 h-5" />
                </motion.span>

                <div className="min-w-0 flex-1">
                  <h4 className={`text-xs font-black leading-tight ${KIND_TEXT[alarm.kind]}`}>
                    {alarm.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    {alarm.message}
                  </p>
                </div>

                <button
                  onClick={() => onDismiss(alarm.key)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title="Descartar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center gap-1.5 justify-end">
                <button
                  onClick={() => onSnooze(alarm, 10)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <Clock4 className="w-3 h-3" />
                  Posponer 10 min
                </button>
                <button
                  onClick={() => onDismiss(alarm.key)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold hover:opacity-90 transition"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Enterado
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
