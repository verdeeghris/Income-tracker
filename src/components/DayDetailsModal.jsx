import { useEffect } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { BTN_PRIMARY_CLASS, paletteOf } from '../constants';
import { formatLongDate, pluralizeLabel } from '../dateUtils';
import { formatMoney } from '../finance';

// Список проектов конкретного дня: открывается по клику на день,
// в котором уже есть проекты. Отсюда можно отредактировать любой проект
// или добавить новый.
export default function DayDetailsModal({ dateKey, instances, onClose, onEdit, onAddProject, onAddLesson }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const total = instances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="modal-sheet max-w-sm"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">{formatLongDate(dateKey)}</h2>
            <p className="mt-0.5 text-xs font-medium text-stone-500 dark:text-zinc-400">
              {pluralizeLabel(instances.length)} · всего {formatMoney(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/5 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {instances.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-200 px-4 py-6 text-center text-xs font-medium text-stone-400 dark:border-white/10 dark:text-zinc-500">
            В этот день пока нет проектов
          </p>
        ) : (
          <ul className="-mx-1 max-h-[46vh] space-y-0.5 overflow-y-auto scrollbar-none">
            {instances.map((instance) => {
              const color = paletteOf(instance.color);
              return (
                <li key={instance.instanceKey}>
                  <button
                    type="button"
                    onClick={() => onEdit(instance)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-stone-100 dark:hover:bg-white/[0.06]"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color.bg }}
                      aria-hidden="true"
                    />
                    <span
                      className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                        instance.isPaid ? 'text-stone-400 line-through dark:text-zinc-500' : ''
                      }`}
                    >
                      {instance.title}
                    </span>
                    {instance.isPaid && (
                      <Check className="h-3.5 w-3.5 shrink-0 stroke-[3] text-emerald-500" aria-label="Выплачено" />
                    )}
                    <span className="shrink-0 text-sm font-extrabold tabular-nums">{formatMoney(instance.amount)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={onAddProject} className={`${BTN_PRIMARY_CLASS} py-2.5`}><span className="inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" />Проект</span></button><button type="button" onClick={onAddLesson} className="rounded-xl border border-stone-200 px-3 py-2.5 text-xs font-bold dark:border-white/10">Урок</button></div>
      </div>
    </div>
  );
}
