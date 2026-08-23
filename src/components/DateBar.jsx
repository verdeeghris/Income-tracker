import { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { MAX_YEAR, MIN_YEAR } from '../constants';
import {
  MONTHS_NOM,
  addDays,
  addMonths,
  formatLongDate,
  formatMonthTitle,
  formatRange,
  getPeriod,
  parseDateKey,
  shiftYears,
} from '../dateUtils';

const MODES = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
];

const NAV_BUTTON_CLASS =
  'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-stone-200 bg-[var(--card)] text-stone-500 shadow-sm transition-colors hover:text-stone-900 hover:border-stone-300 active:scale-95 dark:border-white/10 dark:text-zinc-400 dark:hover:text-white dark:hover:border-white/20';

function titleFor(mode, key) {
  if (mode === 'day') return formatLongDate(key);
  if (mode === 'week') {
    const { from, to } = getPeriod('week', key);
    return formatRange(from, to);
  }
  return formatMonthTitle(key);
}

function Stepper({ label, value, onDec, onInc, decDisabled = false, incDisabled = false }) {
  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:border-white/30 dark:hover:text-white';

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onDec} disabled={decDisabled} aria-label={`Уменьшить: ${label}`} className={buttonClass}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-20 select-none text-center text-xs sm:text-sm font-extrabold tabular-nums">{value}</span>
        <button type="button" onClick={onInc} disabled={incDisabled} aria-label={`Увеличить: ${label}`} className={buttonClass}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function DateBar({ mode, onModeChange, selectedKey, onChange }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selected = parseDateKey(selectedKey);

  useEffect(() => {
    if (!isPickerOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsPickerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPickerOpen]);

  const step = (direction) => {
    if (mode === 'day') onChange(addDays(selectedKey, direction));
    else if (mode === 'week') onChange(addDays(selectedKey, direction * 7));
    else onChange(addMonths(selectedKey, direction));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Общий relative контейнер ровно по ширине блочка навигации */}
      <div className="relative flex items-center justify-between sm:justify-start gap-1">
        <button type="button" onClick={() => step(-1)} aria-label="Предыдущий период" className={NAV_BUTTON_CLASS}>
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsPickerOpen((open) => !open)}
          aria-expanded={isPickerOpen}
          className="flex h-9 sm:h-10 flex-1 sm:flex-initial sm:w-[210px] items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-[var(--card)] px-2 shadow-sm transition-colors hover:border-stone-300 dark:border-white/10 dark:hover:border-white/20"
        >
          <span className="truncate text-xs font-extrabold tracking-tight sm:text-sm">{titleFor(mode, selectedKey)}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 dark:text-zinc-500 ${
              isPickerOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <button type="button" onClick={() => step(1)} aria-label="Следующий период" className={NAV_BUTTON_CLASS}>
          <ChevronRight className="h-4 w-4" />
        </button>

        {isPickerOpen && (
          <>
            <div className="fixed inset-0 z-20 cursor-default" onClick={() => setIsPickerOpen(false)} />
            {/* Шпаргалка строго от левой стрелки до правой (left-0 right-0) */}
            <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-stone-200 bg-[var(--card)] p-2.5 shadow-xl animate-slide-down dark:border-white/10">
              <Stepper
                label="Год"
                value={selected.getFullYear()}
                onDec={() => onChange(shiftYears(selectedKey, -1))}
                onInc={() => onChange(shiftYears(selectedKey, 1))}
                decDisabled={selected.getFullYear() <= MIN_YEAR}
                incDisabled={selected.getFullYear() >= MAX_YEAR}
              />
              <Stepper
                label="Месяц"
                value={MONTHS_NOM[selected.getMonth()]}
                onDec={() => onChange(addMonths(selectedKey, -1))}
                onInc={() => onChange(addMonths(selectedKey, 1))}
              />
              <Stepper
                label="День"
                value={selected.getDate()}
                onDec={() => onChange(addDays(selectedKey, -1))}
                onInc={() => onChange(addDays(selectedKey, 1))}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex w-full sm:w-auto items-center gap-2">
        <div className="flex w-full sm:w-auto rounded-xl border border-stone-200 bg-stone-200/60 p-1 dark:border-white/10 dark:bg-white/[0.04]">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onModeChange(item.id)}
              className={`flex-1 sm:flex-initial rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                mode === item.id
                  ? 'bg-[var(--card)] text-stone-900 shadow-sm dark:text-white'
                  : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}