import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { CARD_CLASS, getThemeDotColor } from '../constants';
import { formatLongDate } from '../dateUtils';
import { formatMoney } from '../finance';

export default function UnpaidPanel({ items, onOpen, isDark }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!items.length) return null;

  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

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
          <ul className="border-t border-stone-100 dark:border-white/5">
            {items.map((item) => {
              const dotBg = getThemeDotColor(item.color, isDark);
              return (
                <li key={item.instanceKey}>
                  <button
                    type="button"
                    onClick={() => onOpen(item)}
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/[0.04] sm:px-5"
                  >
                    <span className="hidden shrink-0 text-xs font-medium text-stone-500 dark:text-zinc-400 sm:block">
                      {formatLongDate(item.date)}
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-200"
                        style={{ backgroundColor: dotBg }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate text-sm font-semibold">{item.title}</span>
                    </span>
                    <span className="shrink-0 text-sm font-extrabold tabular-nums">{formatMoney(item.amount)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
