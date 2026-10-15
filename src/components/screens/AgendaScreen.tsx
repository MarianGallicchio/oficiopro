import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, ChevronLeft, ChevronRight, Clock, X, Trash2, BellDot, CalendarDays, StickyNote, Receipt, FileText,
} from 'lucide-react';
import {
  AgendaEvent, AgendaEventColor, Reminder, Invoice, CurrencyConfig,
} from '../../types';
import { formatMoney } from '../../utils/formatters';

interface Props {
  agendaEvents: AgendaEvent[];
  reminders: Reminder[];
  invoices: Invoice[];
  currency: CurrencyConfig;
  onAddEvent: (event: Omit<AgendaEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const EVENT_COLORS: Record<AgendaEventColor, { dot: string; bg: string; text: string; border: string; label: string }> = {
  sky:     { dot: 'bg-sky-500',    bg: 'bg-sky-50 dark:bg-sky-950/40',    text: 'text-sky-700 dark:text-sky-300',   border: 'border-sky-300 dark:border-sky-800',   label: 'Trabajo' },
  rose:    { dot: 'bg-rose-500',   bg: 'bg-rose-50 dark:bg-rose-950/40',   text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800', label: 'Personal' },
  emerald: { dot: 'bg-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800', label: 'Cobro' },
  amber:   { dot: 'bg-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800', label: 'Reunión' },
  violet:  { dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-300 dark:border-violet-800', label: 'Otro' },
};

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface DayItem {
  kind: 'event' | 'reminder' | 'invoice';
  id: string;
  title: string;
  time?: string;
  color: AgendaEventColor;
  amountInCents?: number;
  extra?: string;
}

export const AgendaScreen: React.FC<Props> = ({ agendaEvents, reminders, invoices, currency, onAddEvent, onDeleteEvent }) => {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(toISO(today));
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

  // Formulario nuevo evento
  const [form, setForm] = useState({
    title: '',
    time: '09:00',
    durationMinutes: 60,
    color: 'sky' as AgendaEventColor,
    reminderMinutes: 30,
    notes: '',
  });

  // Mapa: fecha ISO -> items del día
  const itemsByDate = useMemo(() => {
    const map = new Map<string, DayItem[]>();

    const push = (date: string, item: DayItem) => {
      const list = map.get(date) || [];
      list.push(item);
      map.set(date, list);
    };

    agendaEvents.forEach((e) => {
      push(e.date, {
        kind: 'event',
        id: e.id,
        title: e.title,
        time: e.time,
        color: e.color,
        extra: e.notes,
      });
    });

    reminders.filter((r) => !r.isPaid).forEach((r) => {
      push(r.dueDate, {
        kind: 'reminder',
        id: r.id,
        title: r.title,
        time: r.dueTime,
        color: 'amber',
        amountInCents: r.amountInCents,
        extra: r.frequency === 'monthly' ? 'Mensual' : 'Vencimiento',
      });
    });

    invoices.filter((i) => i.status !== 'paid').forEach((inv) => {
      push(inv.dueDate, {
        kind: 'invoice',
        id: inv.id,
        title: `${inv.docType} ${inv.clientName}`,
        time: undefined,
        color: 'rose',
        amountInCents: inv.totalInCents - inv.paidInCents,
        extra: `Saldo pendiente · N° ${inv.number}`,
      });
    });

    return map;
  }, [agendaEvents, reminders, invoices]);

  // Grilla del mes (semana inicia lunes)
  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const firstDayIndex = (first.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ iso: string; dayNum: number | null }> = [];
    for (let i = 0; i < firstDayIndex; i++) cells.push({ iso: '', dayNum: null });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ iso: toISO(new Date(year, month, d)), dayNum: d });
    }
    while (cells.length % 7 !== 0) cells.push({ iso: '', dayNum: null });
    return cells;
  }, [cursor]);

  const selectedItems: DayItem[] = itemsByDate.get(selectedDate) || [];
  const todayISO = toISO(today);

  const stepMonth = (delta: number) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  const monthEventsCount = useMemo(() => {
    const prefix = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    return [...itemsByDate.keys()].filter((k) => k.startsWith(prefix)).length;
  }, [cursor, itemsByDate]);

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAddEvent({
      title: form.title.trim(),
      date: selectedDate,
      time: form.time,
      durationMinutes: form.durationMinutes,
      color: form.color,
      reminderMinutes: form.reminderMinutes,
      notes: form.notes.trim() || undefined,
    });
    setForm({ title: '', time: '09:00', durationMinutes: 60, color: 'sky', reminderMinutes: 30, notes: '' });
    setIsNewEventOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Agenda de trabajo
          </h3>
          <p className="text-[10px] text-slate-500">Eventos, vencimientos y cobros en un solo calendario</p>
        </div>
        <button
          onClick={() => setIsNewEventOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold shadow-sm transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Evento
        </button>
      </div>

      {/* Calendario */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => stepMonth(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-slate-900 dark:text-white">
            {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
            <span className="ml-2 text-[10px] font-bold text-slate-400">{monthEventsCount} días activos</span>
          </span>
          <button
            onClick={() => stepMonth(1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d) => (
            <span key={d} className="text-center text-[9px] font-black text-slate-400 uppercase">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell, i) => {
            if (!cell.iso) return <span key={`empty-${i}`} />;
            const items = itemsByDate.get(cell.iso) || [];
            const isToday = cell.iso === todayISO;
            const isSelected = cell.iso === selectedDate;

            return (
              <motion.button
                key={cell.iso}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedDate(cell.iso)}
                className={`relative aspect-square rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : isToday
                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                    : items.length
                    ? 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {cell.dayNum}
                {items.length > 0 && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {items.slice(0, 3).map((it) => (
                      <span key={it.id} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : EVENT_COLORS[it.color].dot}`} />
                    ))}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Detalle del día seleccionado */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3 space-y-2">
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
          {(() => {
            const d = new Date(`${selectedDate}T12:00:00`);
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return `${dias[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`;
          })()}
          {selectedDate === todayISO && (
            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 align-middle">HOY</span>
          )}
        </h4>

        <AnimatePresence mode="popLayout">
          {selectedItems.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-5 text-[11px] text-slate-400"
            >
              Día libre · sin eventos, vencimientos ni cobros
            </motion.p>
          ) : (
            selectedItems.map((item, idx) => {
              const c = EVENT_COLORS[item.color];
              return (
                <motion.div
                  key={item.kind + item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`p-2.5 rounded-xl border ${c.bg} ${c.border}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className={`text-[9px] font-black uppercase tracking-wide ${c.text} flex items-center gap-1`}>
                        {item.kind === 'reminder' ? <BellDot className="w-3 h-3" /> : item.kind === 'invoice' ? <Receipt className="w-3 h-3" /> : <StickyNote className="w-3 h-3" />}
                        {item.kind === 'event' ? c.label : item.kind === 'reminder' ? 'Vencimiento' : 'Cobro pendiente'}
                      </span>
                      <h5 className={`text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate`}>{item.title}</h5>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        {item.time && (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{item.time} hs</span>
                          </>
                        )}
                        {item.extra && <span className="truncate max-w-[180px]">· {item.extra}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {item.amountInCents != null && (
                        <span className="font-mono text-[11px] font-black text-slate-800 dark:text-slate-100">
                          {formatMoney(item.amountInCents, currency)}
                        </span>
                      )}
                      {item.kind === 'event' && (
                        deleteCandidate === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { onDeleteEvent(item.id); setDeleteCandidate(null); }}
                              className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white"
                            >
                              Borrar
                            </button>
                            <button onClick={() => setDeleteCandidate(null)} className="text-slate-400"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteCandidate(item.id)}
                            className="text-slate-300 hover:text-rose-500 transition"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* MODAL: NUEVO EVENTO */}
      <AnimatePresence>
        {isNewEventOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
          >
            <motion.form
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onSubmit={handleSaveEvent}
              className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm space-y-3"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-black text-slate-900 dark:text-white text-xs">Nuevo evento · {selectedDate}</h4>
                <button type="button" onClick={() => setIsNewEventOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wide">Título</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="ej. Instalación en Av. Siempre Viva"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wide">Hora</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wide">Duración (min)</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wide">Categoría visual</label>
                <div className="flex gap-1.5">
                  {(Object.keys(EVENT_COLORS) as AgendaEventColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                        form.color === c ? `${EVENT_COLORS[c].bg} ${EVENT_COLORS[c].border} ${EVENT_COLORS[c].text}` : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {EVENT_COLORS[c].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wide">Alarma / aviso</label>
                <select
                  value={form.reminderMinutes}
                  onChange={(e) => setForm({ ...form, reminderMinutes: parseInt(e.target.value) })}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={0}>Al horario exacto</option>
                  <option value={15}>15 minutos antes</option>
                  <option value={30}>30 minutos antes</option>
                  <option value={60}>1 hora antes</option>
                  <option value={1440}>1 día antes</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wide">Notas (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Materiales, dirección, dirección alternativa…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-md shadow-sky-600/25 transition"
              >
                Agregar a la agenda
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
