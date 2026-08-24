import { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { BTN_PRIMARY_CLASS, paletteOf } from '../constants';
import { formatLongDate, pluralizeLabel } from '../dateUtils';
import { formatMoney } from '../finance';

// Список проектов конкретного дня: открывается по клику на день,
// в котором уже есть проекты. Отсюда можно отредактировать любой проект
// или добавить новый.
export default function DayDetailsModal({ dateKey, instances, onClose, onEdit, onAddProject, onAddLesson }) {
  const dialogRef = useRef(null)
  const restoreFocusRef = useRef(null)

  useEffect(() => {
    restoreFocusRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])')
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [onClose]);

  const total = instances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-details-title"
        onClick={(event) => event.stopPropagation()}
        className="modal-sheet max-w-sm"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="day-details-title" className="text-base font-extrabold tracking-tight">{formatLongDate(dateKey)}</h2>
            <p className="mt-0.5 text-xs font-medium text-stone-500 dark:text-zinc-400">
              {pluralizeLabel(instances.filter((item) => item.type === 'project').length, 'проект', 'проекта', 'проектов')} · {pluralizeLabel(instances.filter((item) => item.type === 'lesson').length, 'урок', 'урока', 'уроков')} · всего {formatMoney(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/5 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {instances.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-200 px-4 py-6 text-center text-xs font-medium text-stone-400 dark:border-white/10 dark:text-zinc-500">
            В этот день пока нет записей
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

        <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={onAddProject} className={`${BTN_PRIMARY_CLASS} py-2.5`}>Добавить проект</button><button type="button" onClick={onAddLesson} className={`${BTN_PRIMARY_CLASS} py-2.5`}>Добавить урок</button></div>
      </div>
    </div>
  );
}
