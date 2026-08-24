import { useMemo, useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { CARD_CLASS, getThemeDotColor } from '../constants';
import { formatLongDate } from '../dateUtils';
import { formatMoney } from '../finance';

export default function UnpaidPanel({ items, onOpen, isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredItems = useMemo(() => items.filter((item) => {
    if (filter === 'projects') return item.type === 'project';
    if (filter === 'lessons') return item.type === 'lesson';
    if (filter === 'gph') return item.type === 'project' && item.isGph;
    return true;
  }), [items, filter]);

  if (!items.length) return null;

  const total = filteredItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <section className={`${CARD_CLASS} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-extrabold">Не выплачено</span>
          {/* Четкая контрастная цифра для светлой и темной темы */}
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-black tabular-nums text-white dark:bg-amber-400/20 dark:text-amber-300">
            {items.length}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-sm font-extrabold tabular-nums">{formatMoney(total)}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 dark:text-zinc-500 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="flex gap-1.5 overflow-x-auto border-t border-stone-100 px-4 py-2.5 dark:border-white/5 sm:px-5">
            {[['all', 'Все'], ['projects', 'Проекты'], ['lessons', 'Уроки'], ['gph', 'Проекты в ГПХ']].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${filter === value ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : 'bg-stone-100 text-stone-500 hover:text-stone-900 dark:bg-white/[0.06] dark:text-zinc-400 dark:hover:text-white'}`}>{label}</button>
            ))}
          </div>
          {filteredItems.length === 0 ? <p className="px-4 py-5 text-center text-xs text-stone-500 dark:text-zinc-400 sm:px-5">В этой категории нет неоплаченных записей.</p> : <ul>
            {filteredItems.map((item) => {
              const dotBg = getThemeDotColor(item.color, isDark);
              return (
                <li key={item.instanceKey}>
                  <button
                    type="button"
                    onClick={() => onOpen(item)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/[0.04] sm:px-5"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-200" style={{ backgroundColor: dotBg }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.title}</span>
                    <span className="hidden shrink-0 rounded-full border border-stone-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-stone-500 dark:border-white/10 dark:text-zinc-400 sm:inline-flex">{item.type === 'lesson' ? 'Урок' : 'Проект'}</span>
                    {item.isGph && <span className="hidden shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300 sm:inline-flex">ГПХ</span>}
                    <span className="shrink-0 text-[10px] font-medium text-stone-500 dark:text-zinc-400 sm:text-xs">
                      {formatLongDate(item.date)}
                    </span>
                    <span className="shrink-0 text-sm font-extrabold tabular-nums">{formatMoney(item.amount)}</span>
                  </button>
                </li>
              );
            })}
          </ul>}
        </div>
      </div>
    </section>
  );
}
