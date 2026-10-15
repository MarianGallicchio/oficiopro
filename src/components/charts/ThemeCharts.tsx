import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, BarChart3, TrendingUp, TrendingDown, Minus, PiggyBank, MoveUpRight, MoveDownRight, X, Pencil } from 'lucide-react';
import { Transaction, Category, AppThemeId, CurrencyConfig, AppChartRangeId } from '../../types';
import { formatMoney } from '../../utils/formatters';

/* ============================================================
   Rango compartido por los gráficos de Home (persistido en UserAppSettings)
   ============================================================ */

export type ChartRange = AppChartRangeId;

const RANGE_LABELS: Array<{ id: ChartRange; label: string }> = [
  { id: 'month', label: 'Mes' },
  { id: 'quarter', label: '3 meses' },
  { id: 'year', label: 'Año' },
];

const RANGE_TITLES: Record<ChartRange, string> = {
  month: 'Este mes',
  quarter: 'Últimos 3 meses',
  year: 'Últimos 12 meses',
};

/** Selector de rango (pills animadas) reutilizado por los dos gráficos. */
export const ChartRangeSelector: React.FC<{
  value: ChartRange;
  onChange: (r: ChartRange) => void;
  theme: AppThemeId;
}> = ({ value, onChange, theme }) => {
  const skin = THEME_SKINS[theme];
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
        Analítica
      </span>
      <div
        className="flex items-center gap-0.5 p-0.5 rounded-xl border bg-slate-100/80 dark:bg-slate-950/80"
        style={{ borderColor: skin.axis }}
      >
        {RANGE_LABELS.map((r) => {
          const isActive = value === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onChange(r.id)}
              className="relative px-2.5 py-1 rounded-lg text-[10px] font-black transition-colors"
            >
              {isActive && (
                <motion.span
                  layoutId="chartRangePill"
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: skin.income, boxShadow: `0 2px 10px -2px ${skin.incomeGlow}` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                style={isActive && theme === 'golden' ? { color: '#1c1917' } : undefined}
              >
                {r.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================
   INDICADOR DE BALANCE NETO: ingresos − gastos del rango activo
   Flecha ↑/↓= y color semántico (positivo = verde del tema,
   negativo = rojo del tema, neutro = gris pizarra).
   ============================================================ */

export const NetBalanceIndicator: React.FC<{
  transactions: Transaction[];
  currency: CurrencyConfig;
  theme: AppThemeId;
  range: ChartRange;
  /** Objetivo de neto MENSUAL (centavos). 0 = sin objetivo. */
  netGoalInCents?: number;
  /** Persiste el objetivo mensual editado inline. */
  onGoalChange?: (cents: number) => void;
}> = ({ transactions, currency, theme, range, netGoalInCents = 0, onGoalChange }) => {
  const skin = THEME_SKINS[theme];
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');  const { netCents, incomeCents, expenseCents, savingsAllocatedCents, prevNetCents } = useMemo(() => {
    const windowKeys = new Set(rangeWindow(range));
    const txs = transactions.filter((t) => windowKeys.has(ymOf(t.date)));
    const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amountInCents, 0);
    const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amountInCents, 0);
    // Aportes a metas: las transacciones marcadas con savingsGoalId
    const savings = txs
      .filter((t) => t.type === 'expense' && t.savingsGoalId)
      .reduce((s, t) => s + t.amountInCents, 0);

    // Ventana inmediatamente anterior (misma duración) para la comparación
    const count = range === 'month' ? 1 : range === 'quarter' ? 3 : 12;
    const now = new Date();
    const prevKeys = new Set(Array.from({ length: count }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (count + i), 1);
      return ym(d);
    }));
    const prevTxs = transactions.filter((t) => prevKeys.has(ymOf(t.date)));
    const prevIncome = prevTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amountInCents, 0);
    const prevExpense = prevTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amountInCents, 0);

    return {
      netCents: income - expense,
      incomeCents: income,
      expenseCents: expense,
      savingsAllocatedCents: savings,
      prevNetCents: prevIncome - prevExpense,
    };
  }, [transactions, range]);

  // Tendencia vs período anterior: en un balance, subir es mejorar
  const deltaCents = netCents - prevNetCents;
  const prevNetNonZero = prevNetCents !== 0;
  const deltaPct = prevNetNonZero ? Math.round((deltaCents / Math.abs(prevNetCents)) * 100) : null;
  const trendUp = deltaCents > 0;
  const trendFlat = deltaCents === 0;
  const trendAccent = trendFlat ? '#64748b' : trendUp ? skin.income : skin.expense;
  const TrendIcon = trendFlat ? Minus : trendUp ? MoveUpRight : MoveDownRight;

  const savingsSharePct = netCents > 0
    ? Math.min(100, Math.round((savingsAllocatedCents / netCents) * 100))
    : 0;

  // Objetivo de neto mensual, proporcional al largo del rango (mes ×1, 3M ×3, año ×12)
  const goalMonths = range === 'month' ? 1 : range === 'quarter' ? 3 : 12;
  const goalTotalCents = netGoalInCents > 0 ? netGoalInCents * goalMonths : 0;
  const goalPct = goalTotalCents > 0
    ? Math.max(0, Math.min(100, Math.round((netCents / goalTotalCents) * 100)))
    : 0;
  const goalMet = goalTotalCents > 0 && netCents >= goalTotalCents;
  const goalShortfallCents = Math.max(0, goalTotalCents - netCents);
  const goalBarColor = goalMet ? skin.income : goalPct > 0 ? '#f59e0b' : skin.expense;

  const isPositive = netCents > 0;
  const isZero = netCents === 0;
  const accent = isZero ? '#64748b' : isPositive ? skin.income : skin.expense;
  const Arrow = isZero ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      key={range}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="rounded-2xl border p-3 relative overflow-hidden"
      style={{
        borderColor: `${accent}33`,
        backgroundColor: `${accent}0d`,
      }}
    >
      {/* Resplandor del acento en el borde superior */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-6 right-6 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }}
      />

      <div className="flex items-center justify-between gap-2">
        {/* Etiqueta + desglose + objetivo */}
        <div className="min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest block" style={{ color: accent }}>
            Balance neto · {RANGE_TITLES[range]}
          </span>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            <span style={{ color: skin.income }}>▲ {formatMoney(incomeCents, currency)}</span>
            <span className="opacity-50">−</span>
            <span style={{ color: skin.expense }}>▼ {formatMoney(expenseCents, currency)}</span>
          </div>

          {/* Comparación vs período anterior */}
          <div className="flex items-center gap-1 mt-1">
            <span
              className="flex items-center gap-0.5 text-[9px] font-black px-1 py-0.5 rounded-md"
              style={{ color: trendAccent, backgroundColor: `${trendAccent}14` }}
            >
              <TrendIcon className="w-3 h-3" strokeWidth={2.6} />
              {deltaPct !== null
                ? `${deltaPct > 0 ? '+' : ''}${deltaPct}%`
                : trendFlat
                ? '±0%'
                : `${deltaCents > 0 ? '+' : ''}${formatMoney(deltaCents, currency)}`}
            </span>
            <span className="text-[8px] font-bold text-slate-400">
              {range === 'month' ? 'vs mes anterior' : range === 'quarter' ? 'vs trimestre anterior' : 'vs año anterior'}
            </span>
          </div>

          {/* OBJETIVO DE NETO del rango (barra + alerta + edición inline) */}
          {goalTotalCents > 0 && !editingGoal && (
            <div className="mt-1.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: goalBarColor }}>
                  {goalMet ? '✓ Objetivo cumplido' : 'Objetivo' }
                </span>
                <span className="text-[8px] font-mono font-bold text-slate-400 truncate">
                  {formatMoney(goalTotalCents, currency)}
                </span>
                {onGoalChange && (
                  <button
                    type="button"
                    onClick={() => { setGoalInput(String(netGoalInCents / 100)); setEditingGoal(true); }}
                    className="text-slate-300 hover:text-sky-600 transition shrink-0"
                    title="Editar objetivo mensual"
                    aria-label="Editar objetivo mensual"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <div className="mt-0.5 h-1.5 rounded-full overflow-hidden w-full max-w-[180px]" style={{ backgroundColor: `${goalBarColor}1f` }}>
                <motion.div
                  key={range}
                  initial={{ width: 0 }}
                  animate={{ width: `${goalPct}%` }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 140, damping: 20 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: goalBarColor, boxShadow: `0 0 8px ${goalBarColor}66` }}
                />
              </div>
              {!goalMet && (
                <p className="text-[8px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  ⚠ Bajo el objetivo · faltan {formatMoney(goalShortfallCents, currency)}
                </p>
              )}
            </div>
          )}

          {editingGoal && (
            <div className="mt-1.5 flex items-center gap-1">
              <input
                type="number"
                autoFocus
                min={0}
                step="1000"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const cents = Math.round((parseFloat(goalInput) || 0) * 100);
                    if (onGoalChange) onGoalChange(Math.max(0, cents));
                    setEditingGoal(false);
                  }
                  if (e.key === 'Escape') setEditingGoal(false);
                }}
                className="w-24 px-1.5 py-0.5 text-[10px] rounded-md border border-sky-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                aria-label="Objetivo mensual de neto"
              />
              <button
                type="button"
                onClick={() => {
                  const cents = Math.round((parseFloat(goalInput) || 0) * 100);
                  if (onGoalChange) onGoalChange(Math.max(0, cents));
                  setEditingGoal(false);
                }}
                className="px-1.5 py-0.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-[9px] font-black"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setEditingGoal(false)}
                className="text-[9px] font-bold text-slate-400"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Neto con flecha animada */}
        <motion.div
          className="flex items-center gap-2 shrink-0"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <motion.span
            animate={
              isZero
                ? { rotate: 0 }
                : isPositive
                ? { y: [0, -3, 0], transition: { repeat: Infinity, repeatDelay: 2.4, duration: 0.6 } }
                : { y: [0, 3, 0], transition: { repeat: Infinity, repeatDelay: 2.4, duration: 0.6 } }
            }
            className="grid place-items-center w-7 h-7 rounded-xl"
            style={{ backgroundColor: `${accent}1a`, color: accent }}
          >
            <Arrow className="w-4 h-4" strokeWidth={2.6} />
          </motion.span>

          <span
            className={`text-base font-black font-mono tracking-tight ${isZero ? 'text-slate-500' : ''}`}
            style={!isZero ? { color: accent, textShadow: `0 0 14px ${accent}44` } : undefined}
          >
            {isPositive ? '+' : ''}{formatMoney(netCents, currency)}
          </span>
        </motion.div>
      </div>

      {/* Cuánto del neto se destinó a metas de ahorro */}
      <div className="mt-2 pt-2 border-t" style={{ borderColor: `${accent}22` }}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 min-w-0">
            <PiggyBank className="w-3 h-3 shrink-0" style={{ color: skin.income }} />
            Aportado a metas de ahorro
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono font-black" style={{ color: skin.income }}>
              {formatMoney(savingsAllocatedCents, currency)}
            </span>
            {netCents > 0 && savingsAllocatedCents > 0 && (
              <span
                className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                style={{ color: skin.income, backgroundColor: `${skin.income}1a` }}
              >
                {savingsSharePct}% del neto
              </span>
            )}
          </div>
        </div>

        {/* Barra: porción del neto que quedó reservada a metas */}
        <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${skin.income}1f` }}>
          <motion.div
            key={range}
            initial={{ width: 0 }}
            animate={{ width: `${savingsSharePct}%`, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 140, damping: 20 }}
            className="h-full rounded-full"
            style={{ backgroundColor: skin.income, boxShadow: `0 0 8px ${skin.incomeGlow}` }}
          />
        </div>

        {netCents <= 0 && savingsAllocatedCents > 0 && (
          <p className="text-[8px] font-bold text-amber-600 dark:text-amber-400 mt-1">
            ⚠ El rango cierra en déficit pero igual aportaste a metas. Revisá el orden: primero el colchón del mes.
          </p>
        )}
      </div>
    </motion.div>
  );
};

/* ============================================================
   Paleta + acentos por tema (se sincronizan con el HUD activo)
   ============================================================ */

interface ThemeChartSkin {
  income: string;
  expense: string;
  incomeGlow: string;
  expenseGlow: string;
  axis: string;
  track: string;
  donutGlow: string;
}

const THEME_SKINS: Record<AppThemeId, ThemeChartSkin> = {
  minimal: {
    income: '#059669', expense: '#e11d48', incomeGlow: 'rgba(16,185,129,0.35)',
    expenseGlow: 'rgba(225,29,72,0.35)', axis: 'rgba(100,116,139,0.35)',
    track: 'rgba(148,163,184,0.15)', donutGlow: 'rgba(2,132,199,0.18)',
  },
  sakura: {
    income: '#fb7185', expense: '#be123c', incomeGlow: 'rgba(251,113,133,0.45)',
    expenseGlow: 'rgba(190,18,60,0.4)', axis: 'rgba(244,114,182,0.35)',
    track: 'rgba(251,207,232,0.3)', donutGlow: 'rgba(244,114,182,0.25)',
  },
  cyberpunk: {
    income: '#00f0ff', expense: '#ff007f', incomeGlow: 'rgba(0,240,255,0.55)',
    expenseGlow: 'rgba(255,0,127,0.55)', axis: 'rgba(0,240,255,0.3)',
    track: 'rgba(0,240,255,0.08)', donutGlow: 'rgba(0,240,255,0.3)',
  },
  golden: {
    income: '#f59e0b', expense: '#b45309', incomeGlow: 'rgba(245,158,11,0.45)',
    expenseGlow: 'rgba(180,83,9,0.4)', axis: 'rgba(180,83,9,0.3)',
    track: 'rgba(250,204,21,0.25)', donutGlow: 'rgba(250,204,21,0.25)',
  },
  aurora: {
    income: '#8b5cf6', expense: '#f472b6', incomeGlow: 'rgba(139,92,246,0.55)',
    expenseGlow: 'rgba(244,114,182,0.55)', axis: 'rgba(196,181,253,0.35)',
    track: 'rgba(196,181,253,0.18)', donutGlow: 'rgba(139,92,246,0.3)',
  },
  nocturn: {
    income: '#7dd3fc', expense: '#f472b6', incomeGlow: 'rgba(125,211,252,0.55)',
    expenseGlow: 'rgba(244,114,182,0.55)', axis: 'rgba(148,163,184,0.35)',
    track: 'rgba(148,163,184,0.18)', donutGlow: 'rgba(125,211,252,0.3)',
  },
};

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const ymOf = (iso: string) => iso.slice(0, 7);

/** Ventana de meses incluida por rango (0 = mes corriente). */
function rangeWindow(range: ChartRange): Array<string> {
  const now = new Date();
  const count = range === 'month' ? 1 : range === 'quarter' ? 3 : 12;
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return ym(d);
  });
}

/* ============================================================
   TORTA / DONUT: gastos por categoría en el rango activo
   ============================================================ */

interface DonutSlice {
  id: string;
  label: string;
  color: string;
  amountInCents: number;
  percent: number;
}

export const CategoryDonutChart: React.FC<{
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  theme: AppThemeId;
  range: ChartRange;
}> = ({ transactions, categories, currency, theme, range }) => {
  const skin = THEME_SKINS[theme];
  const [hovered, setHovered] = useState<string | null>(null);

  const windowKeys = useMemo(() => new Set(rangeWindow(range)), [range]);
  const hasPeriodData = useMemo(
    () => transactions.some((t) => t.type === 'expense' && windowKeys.has(ymOf(t.date))),
    [transactions, windowKeys],
  );

  const slices: DonutSlice[] = useMemo(() => {
    const periodTxs = transactions.filter((t) => t.type === 'expense' && windowKeys.has(ymOf(t.date)));
    // Si el rango aún está vacío, usa el histórico para que el gráfico nunca esté vacío
    const src = periodTxs.length > 0 ? periodTxs : transactions.filter((t) => t.type === 'expense');

    const byCat = new Map<string, number>();
    src.forEach((t) => byCat.set(t.categoryId, (byCat.get(t.categoryId) || 0) + t.amountInCents));

    const total = [...byCat.values()].reduce((s, v) => s + v, 0);
    if (total === 0) return [];

    const entries = [...byCat.entries()]
      .map(([catId, cents]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          label: cat?.name || 'Sin categoría',
          color: cat?.color || '#94a3b8',
          amountInCents: cents,
          percent: Math.round((cents / total) * 100),
        };
      })
      .sort((a, b) => b.amountInCents - a.amountInCents);

    // Top 6 + "Otros"
    if (entries.length > 7) {
      const rest = entries.slice(6);
      const restCents = rest.reduce((s, e) => s + e.amountInCents, 0);
      return [...entries.slice(0, 6), {
        id: 'otros',
        label: `Otros (${rest.length})`,
        color: '#64748b',
        amountInCents: restCents,
        percent: Math.round((restCents / total) * 100),
      }];
    }
    return entries;
  }, [transactions, categories, windowKeys]);

  const totalCents = slices.reduce((s, sl) => s + sl.amountInCents, 0);
  const active = hovered ?? (slices.length === 1 ? slices[0].id : null);
  const activeSlice = slices.find((s) => s.id === active);

  return (
    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
      {/* Resplandor del tema */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl op-glow pointer-events-none"
        style={{ background: skin.donutGlow }}
      />

      <div className="flex items-center justify-between mb-1 relative">
        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <PieChart className="w-4 h-4" style={{ color: skin.expense }} />
          Gastos por categoría
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase">
          {hasPeriodData ? RANGE_TITLES[range] : 'Histórico'}
        </span>
      </div>

      {slices.length === 0 ? (
        <p className="text-center py-6 text-[11px] text-slate-400">
          Cargá tu primer gasto para ver el desglose por categoría.
        </p>
      ) : (
        <div className="flex items-center gap-3 mt-2 relative">
          {/* Donut SVG */}
          <div className="relative shrink-0">
            <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
              <circle cx="60" cy="60" r="46" fill="none" stroke={skin.track} strokeWidth="14" />
              {slices.map((sl, i) => {
                const offset = slices.slice(0, i).reduce((s, x) => s + x.percent, 0);
                const isActive = sl.id === active;
                return (
                  <motion.circle
                    key={`${range}-${sl.id}`}
                    cx="60" cy="60" r="46"
                    fill="none"
                    stroke={sl.color}
                    strokeWidth={isActive ? 18 : 14}
                    pathLength={100}
                    strokeDasharray={`${Math.max(0, sl.percent - (isActive ? 1.5 : 0.8))} ${100}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                    style={{ filter: isActive ? `drop-shadow(0 0 6px ${sl.color})` : undefined, cursor: 'pointer', transition: 'stroke-width 180ms ease' }}
                    onMouseEnter={() => setHovered(sl.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setHovered(hovered === sl.id ? null : sl.id)}
                    initial={{ opacity: 0, strokeDasharray: '0 100' }}
                    animate={{ opacity: 1, strokeDasharray: `${Math.max(0, sl.percent - (isActive ? 1.5 : 0.8))} ${100}` }}
                    transition={{
                      opacity: { delay: 0.15 + i * 0.08, duration: 0.3 },
                      strokeDasharray: { delay: 0.15 + i * 0.12, type: 'spring', stiffness: 60, damping: 18 },
                    }}
                  />
                );
              })}
            </svg>

            {/* Centro: monto del slice activo o total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.span
                key={`${range}-${activeSlice ? activeSlice.id : 'total'}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
                className="text-[10px] font-black text-slate-900 dark:text-white leading-none"
              >
                {formatMoney(activeSlice ? activeSlice.amountInCents : totalCents, currency)}
              </motion.span>
              <span className="text-[8px] font-bold text-slate-400 mt-0.5 max-w-[70px] truncate">
                {activeSlice ? activeSlice.label : 'Total gastado'}
              </span>
            </div>
          </div>

          {/* Leyenda */}
          <ul className="flex-1 min-w-0 space-y-1">
            {slices.map((sl, i) => (
              <motion.li
                key={`${range}-${sl.id}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                onMouseEnter={() => setHovered(sl.id)}
                onMouseLeave={() => setHovered(null)}
                className={`flex items-center justify-between gap-1.5 px-1.5 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  sl.id === active ? 'bg-slate-100 dark:bg-slate-800' : ''
                }`}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sl.color, boxShadow: sl.id === active ? `0 0 6px ${sl.color}` : undefined }} />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{sl.label}</span>
                </span>
                <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 shrink-0">
                  {sl.percent}%
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   BARRAS: evolución en el rango activo
   - month   → semanas del mes corriente (S1…S5)
   - quarter → meses últimos 3 (gastos vs ingresos)
   - year    → meses últimos 12
   ============================================================ */

interface TrendBucket {
  key: string;
  label: string;
  income: number;
  expense: number;
}

export const MonthlyTrendChart: React.FC<{
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  theme: AppThemeId;
  range: ChartRange;
}> = ({ transactions, categories, currency, theme, range }) => {
  const skin = THEME_SKINS[theme];
  const [hovered, setHovered] = useState<number | null>(null);
  // Mes seleccionado para el desglose (toca la ★/▼ o la columna)
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedKey(null);
  }, [range]);

  const buckets: TrendBucket[] = useMemo(() => {
    const now = new Date();

    if (range === 'month') {
      // Semanas naturales del mes corriente (1–7, 8–14, …)
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const weekCount = Math.ceil(daysInMonth / 7);
      return Array.from({ length: weekCount }, (_, i) => {
        const startDay = i * 7 + 1;
        const endDay = Math.min(daysInMonth, (i + 1) * 7);
        const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const txs = transactions.filter((t) => {
          if (ymOf(t.date) !== monthPrefix) return false;
          const day = parseInt(t.date.slice(8, 10), 10);
          return day >= startDay && day <= endDay;
        });
        return {
          key: `w${i}`,
          label: `S${i + 1}`,
          income: txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amountInCents, 0),
          expense: txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amountInCents, 0),
        };
      });
    }

    const count = range === 'quarter' ? 3 : 12;
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
      const key = ym(d);
      const monthTxs = transactions.filter((t) => ymOf(t.date) === key);
      return {
        key,
        label: d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', ''),
        income: monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amountInCents, 0),
        expense: monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amountInCents, 0),
      };
    });
  }, [transactions, range]);

  const maxCents = Math.max(1, ...buckets.map((m) => Math.max(m.income, m.expense)));
  const maxLabel = formatMoney(maxCents, currency);
  const narrow = buckets.length > 6; // año: barras más finas

  // Mejor y peor mes del año por balance neto (solo en modo Año)
  const { bestIdx, worstIdx } = useMemo(() => {
    if (range !== 'year') return { bestIdx: -1, worstIdx: -1 };
    const nets = buckets.map((b) => b.income - b.expense);
    if (nets.every((n) => n === 0)) return { bestIdx: -1, worstIdx: -1 };
    const best = Math.max(...nets);
    const worst = Math.min(...nets);
    return {
      bestIdx: best > 0 ? nets.indexOf(best) : -1,
      worstIdx: worst < 0 ? nets.lastIndexOf(worst) : -1,
    };
  }, [buckets, range]);

  // Desglose del mes seleccionado (solo meses, no semanas)
  const selectedBucketKey = buckets.some((b) => b.key === selectedKey) && range !== 'month'
    ? selectedKey
    : null;

  const monthDetail = useMemo(() => {
    if (!selectedBucketKey) return null;
    const monthTxs = transactions.filter((t) => ymOf(t.date) === selectedBucketKey);
    const income = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amountInCents, 0);
    const expense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amountInCents, 0);

    const byCat = new Map<string, number>();
    monthTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => byCat.set(t.categoryId, (byCat.get(t.categoryId) || 0) + t.amountInCents));
    const cats = [...byCat.entries()]
      .map(([catId, cents]) => {
        const cat = categories.find((c) => c.id === catId);
        return { id: catId, label: cat?.name || 'Sin categoría', color: cat?.color || '#94a3b8', cents };
      })
      .sort((a, b) => b.cents - a.cents)
      .slice(0, 4);

    const [yStr, mStr] = selectedBucketKey.split('-');
    const title = new Date(Number(yStr), Number(mStr) - 1, 1)
      .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

    return { key: selectedBucketKey, title, income, expense, cats };
  }, [selectedBucketKey, transactions, categories]);

  const monthDetailBadge = monthDetail
    ? buckets.findIndex((b) => b.key === monthDetail.key) === bestIdx
      ? 'best'
      : buckets.findIndex((b) => b.key === monthDetail.key) === worstIdx
      ? 'worst'
      : null
    : null;

  return (
    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
      <div className="flex items-center justify-between mb-2 relative">
        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4" style={{ color: skin.income }} />
          {range === 'month' ? 'Evolución semanal' : 'Evolución mensual'}
        </span>          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: skin.income, boxShadow: `0 0 5px ${skin.incomeGlow}` }} />Ingresos</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: skin.expense, boxShadow: `0 0 5px ${skin.expenseGlow}` }} />Gastos</span>
          </div>
      </div>

      {/* Gráfico de barras (divs animados, escalables) */}
      <div className={`relative flex items-end ${narrow ? 'justify-between gap-0.5' : 'justify-between gap-1.5'} h-28 px-1.5`}>
        {/* Línea de referencia superior */}
        <span className="absolute top-0 left-0 right-0 border-t border-dashed" style={{ borderColor: skin.axis }} />
        <span className="absolute top-0 right-0 -translate-y-full text-[7px] font-mono font-bold" style={{ color: skin.axis }}>
          {maxLabel}
        </span>

        {buckets.map((m, i) => {
          const incomePct = Math.max(2, Math.round((m.income / maxCents) * 100));
          const expensePct = Math.max(2, m.income + m.expense === 0 ? 1 : Math.round((m.expense / maxCents) * 100));
          const isHovered = hovered === i;
          const isCurrent = range === 'month' ? i === buckets.length - 1 : i === buckets.length - 1;

          return (
            <div
              key={m.key}
              role={range === 'month' ? undefined : 'button'}
              title={range === 'month' ? undefined : 'Ver desglose del mes'}
              onClick={range === 'month' ? undefined : () => setSelectedKey((k) => (k === m.key ? null : m.key))}
              className={range === 'month'
                ? 'flex-1 flex flex-col items-center gap-1 h-full justify-end relative'
                : `flex-1 flex flex-col items-center gap-1 h-full justify-end relative cursor-pointer rounded-lg py-1 -my-1 transition-colors ${selectedKey === m.key ? 'bg-slate-100 dark:bg-slate-800/80' : ''}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-1 z-10 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-bold px-1.5 py-1 whitespace-nowrap shadow-lg pointer-events-none"
                >
                  <span style={{ color: theme === 'cyberpunk' ? '#00f0ff' : undefined }}>▲ {formatMoney(m.income, currency)}</span>
                  {' · '}
                  <span>▼ {formatMoney(m.expense, currency)}</span>
                  {i === bestIdx && <span className="text-emerald-400"> · ★ mejor mes</span>}
                  {i === worstIdx && <span className="text-rose-400"> · peor mes</span>}
                </motion.div>
              )}

              {/* Marcas de mejor / peor mes del año */}
              {i === bestIdx && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.04, type: 'spring', stiffness: 260, damping: 18 }}
                  onClick={(e) => { e.stopPropagation(); setSelectedKey((k) => (k === m.key ? null : m.key)); }}
                  className={`absolute -top-4 z-10 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] grid place-items-center shadow-md shadow-emerald-500/40 cursor-pointer transition-transform ${selectedKey === m.key ? 'scale-125' : 'hover:scale-110'}`}
                  title="Mejor balance del año · ver desglose"
                  aria-label={`Ver desglose del mejor mes (${m.label})`}
                >
                  ★
                </motion.button>
              )}
              {i === worstIdx && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.04, type: 'spring', stiffness: 260, damping: 18 }}
                  onClick={(e) => { e.stopPropagation(); setSelectedKey((k) => (k === m.key ? null : m.key)); }}
                  className={`absolute -top-4 z-10 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] grid place-items-center shadow-md shadow-rose-500/40 cursor-pointer transition-transform ${selectedKey === m.key ? 'scale-125' : 'hover:scale-110'}`}
                  title="Peor balance del año · ver desglose"
                  aria-label={`Ver desglose del peor mes (${m.label})`}
                >
                  ▼
                </motion.button>
              )}

              {i === buckets.length - 1 && (
                <span className="absolute bottom-full mb-0.5 text-[7px] font-black uppercase tracking-wider px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {range === 'month' ? 'semana' : 'hoy'}
                </span>
              )}

              {/* Par de barras (el mejor/peor mes lleva glow propio del marcador) */}
              <div className="flex items-end gap-1 h-full w-full justify-center pb-3" role="listitem" aria-label={`${m.label}: ${new Date(2026, 6, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`}>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${incomePct}%`, opacity: 1 }}
                  transition={{ delay: 0.1 + Math.min(i * 0.05, 0.5), type: 'spring', stiffness: 120, damping: 20 }}
                  className={`${narrow ? 'w-1' : 'w-2.5 sm:w-3'} rounded-t-md`}
                  style={{
                    background: `linear-gradient(to top, ${skin.income}cc, ${skin.income})`,
                    boxShadow: isHovered || i === bestIdx || i === worstIdx ? `0 0 10px ${i === worstIdx ? skin.expenseGlow : skin.incomeGlow}` : undefined,
                    transition: 'box-shadow 150ms ease',
                  }}
                />
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${expensePct}%`, opacity: 1 }}
                  transition={{ delay: 0.16 + Math.min(i * 0.05, 0.5), type: 'spring', stiffness: 120, damping: 20 }}
                  className={`${narrow ? 'w-1' : 'w-2.5 sm:w-3'} rounded-t-md`}
                  style={{
                    background: `linear-gradient(to top, ${skin.expense}cc, ${skin.expense})`,
                    boxShadow: isHovered ? `0 0 10px ${skin.expenseGlow}` : undefined,
                    transition: 'box-shadow 150ms ease',
                  }}
                />
              </div>

              <span className={`text-[8px] font-bold ${
                i === bestIdx
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : i === worstIdx
                  ? 'text-rose-600 dark:text-rose-400'
                  : isCurrent
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-slate-400'
              }`}>
                {i === bestIdx ? '★' : i === worstIdx ? '▼' : ''} {m.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Leyenda de marcas (solo modo Año con datos) */}
      {(bestIdx > -1 || worstIdx > -1) && (
        <div className="flex items-center justify-center gap-3 mt-1 text-[8px] font-bold text-slate-400">
          {bestIdx > -1 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white text-[6px] grid place-items-center">★</span>
              Mejor mes neto
            </span>
          )}
          {worstIdx > -1 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 text-white text-[6px] grid place-items-center">▼</span>
              Peor mes neto
            </span>
          )}
          <span className="opacity-70">(ingresos − gastos)</span>
        </div>
      )}

      {/* DETALLE DEL MES SELECCIONADO (toca la ★/▼ o la columna) */}
      <AnimatePresence>
        {monthDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border" style={{ borderColor: skin.track }}>
              {/* Encabezado: marca + mes + cerrar */}
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 min-w-0">
                  {monthDetailBadge === 'best' && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] grid place-items-center shrink-0">★</span>
                  )}
                  {monthDetailBadge === 'worst' && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] grid place-items-center shrink-0">▼</span>
                  )}
                  <h5 className="text-[11px] font-black text-slate-900 dark:text-white capitalize truncate">
                    {monthDetail.title}
                  </h5>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedKey(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Cerrar desglose"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Ingresos / Gastos / Neto del mes */}
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Ingresos</span>
                  <span className="text-[10px] font-mono font-black" style={{ color: skin.income }}>
                    {formatMoney(monthDetail.income, currency)}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Gastos</span>
                  <span className="text-[10px] font-mono font-black" style={{ color: skin.expense }}>
                    {formatMoney(monthDetail.expense, currency)}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Neto</span>
                  <span
                    className="text-[10px] font-mono font-black"
                    style={{ color: monthDetail.income - monthDetail.expense >= 0 ? skin.income : skin.expense }}
                  >
                    {monthDetail.income - monthDetail.expense > 0 ? '+' : ''}
                    {formatMoney(monthDetail.income - monthDetail.expense, currency)}
                  </span>
                </div>
              </div>

              {/* Top categorías del mes (gastos) */}
              <div className="mt-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  Top categorías del mes
                </span>
                {monthDetail.cats.length === 0 ? (
                  <p className="text-[10px] text-slate-400 py-1.5">Sin gastos categorizados este mes 🎉</p>
                ) : (
                  <ul className="space-y-1">
                    {monthDetail.cats.map((cat, ci) => {
                      const pct = Math.round((cat.cents / monthDetail.cats[0].cents) * 100);
                      return (
                        <motion.li
                          key={cat.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + ci * 0.05 }}
                          className="space-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                              <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate">{cat.label}</span>
                            </span>
                            <span className="text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 shrink-0">
                              {formatMoney(cat.cents, currency)}
                            </span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden ml-3.5" style={{ backgroundColor: skin.track }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.12 + ci * 0.05, type: 'spring', stiffness: 160, damping: 20 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
