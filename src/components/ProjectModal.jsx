import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
} from 'lucide-react';
import {
  BTN_GHOST_CLASS,
  BTN_PRIMARY_CLASS,
  INPUT_CLASS,
  MAX_COPIES,
  PALETTE,
  TAX_PERCENT,
  paletteOf,
} from '../constants';
import {
  WEEKDAYS_SHORT,
  addMonths,
  formatLongDate,
  formatMonthTitle,
  getMonthMatrix,
  parseDateKey,
} from '../dateUtils';
import { formatMoney, netOf } from '../finance';
import { presetMonthEnd, presetNextWeeks } from '../copyDates';

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export function CopyPicker({ anchorKey, selectedSet, onToggle, itemLabel = 'проектами' }) {
  const [viewKey, setViewKey] = useState(anchorKey);
  const view = parseDateKey(viewKey);
  const viewYear = view.getFullYear();
  const viewMonth = view.getMonth();
  const weeks = getMonthMatrix(viewYear, viewMonth);

  const navButtonClass =
    'rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-white';

  return (
    <div className="mt-2 rounded-xl border border-stone-200 p-2.5 animate-slide-down dark:border-white/10">
      <div className="mb-1.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewKey(addMonths(viewKey, -1))}
          aria-label="Предыдущий месяц"
          className={navButtonClass}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-extrabold">
          {formatMonthTitle(viewKey)}
        </span>
        <button
          type="button"
          onClick={() => setViewKey(addMonths(viewKey, 1))}
          aria-label="Следующий месяц"
          className={navButtonClass}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS_SHORT.map((weekday) => (
          <div
            key={weekday}
            className="pb-0.5 text-center text-[9px] font-bold uppercase text-stone-400 dark:text-zinc-500"
          >
            {weekday}
          </div>
        ))}
        {weeks.flat().map((key) => {
          const isAnchor = key === anchorKey;
          const isSelected = selectedSet.has(key);
          const outside = parseDateKey(key).getMonth() !== view.getMonth();
          return (
            <button
              key={key}
              type="button"
              disabled={isAnchor || outside}
              onClick={() => onToggle(key)}
              className={`flex h-7 items-center justify-center rounded-md text-[11px] font-bold tabular-nums transition-colors ${
                isAnchor
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-zinc-900'
                  : isSelected
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : outside
                  ? 'cursor-default opacity-25'
                  : 'text-stone-600 hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-white/10'
              }`}
            >
              {parseDateKey(key).getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-center text-[11px] font-medium text-stone-400 dark:text-zinc-500">
        Копии создаются независимыми {itemLabel}
      </p>
    </div>
  );
}

export default function ProjectModal({
  dateKey,
  instance,
  templates,
  isDark,
  onClose,
  onSave,
  onDelete,
}) {
  const isEdit = Boolean(instance);
  const projectTemplates = templates.filter((item) => item.type === 'project');

  const [title, setTitle] = useState(instance?.title || '');
  const [amount, setAmount] = useState(
    instance?.amount ? String(instance.amount) : ''
  );
  const [color, setColor] = useState(instance?.color || PALETTE[0].id);
  const [isPaid, setIsPaid] = useState(Boolean(instance?.isPaid));
  const [isGph, setIsGph] = useState(Boolean(instance?.isGph ?? instance?.is_gph));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [copyDates, setCopyDates] = useState(() => new Set());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const toggleCopyDate = (key) => {
    setCopyDates((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else if (next.size < MAX_COPIES) {
        next.add(key);
      }
      return next;
    });
  };

  // Перезаписывание active-пресета на новый при нажатии
  const applyPreset = (keys) => {
    const uniqueKeys = [...new Set(keys)].filter((key) => key !== dateKey);
    setCopyDates((previous) => {
      const isAlreadyActive = uniqueKeys.length === previous.size && uniqueKeys.every((key) => previous.has(key));
      return isAlreadyActive ? new Set() : new Set(uniqueKeys);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSaving || !title.trim() || !amount) return;
    setIsSaving(true);
    Promise.resolve(onSave({
      title: title.trim(),
      amount: Number(amount),
      color,
      isPaid,
      isGph,
      copyDates: Array.from(copyDates).sort(),
    })).finally(() => setIsSaving(false));
  };

  const applyTemplate = (template) => {
    setTitle(template.title);
    setColor(template.color);
    if (template.amount) setAmount(String(template.amount));
  };

  const presetButtonClass =
    'rounded-lg border border-stone-200 px-2.5 py-1.5 text-[11px] font-bold text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/30 dark:hover:text-white';

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-[var(--card)] p-5 shadow-2xl animate-pop-in dark:border-white/10 sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">
              {isEdit ? 'Редактировать проект' : 'Новый проект'}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-stone-500 dark:text-zinc-400">
              {formatLongDate(dateKey)}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && projectTemplates.length > 0 && (
            <Field label="Использовать прошлый проект">
              <div className="flex gap-1.5 overflow-x-auto p-1 scrollbar-none">
                {projectTemplates.map((template) => {
                  const templateColor = paletteOf(template.color);
                  return (
                    <button
                      key={template.title}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors hover:brightness-95 dark:hover:brightness-110"
                      style={{
                        backgroundColor: isDark
                          ? templateColor.darkBg
                          : templateColor.bg,
                        borderColor: isDark
                          ? templateColor.darkBorder
                          : templateColor.border,
                        color: isDark
                          ? templateColor.darkText
                          : templateColor.text,
                      }}
                    >
                      {template.title}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          <Field label="Название проекта">
            <input
              type="text"
              required
              maxLength={80}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например, вёрстка лендинга"
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Оплата по договору">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value.replace(/\D/g, '').slice(0, 9))
                }
                placeholder="15 000"
                className={`${INPUT_CLASS} pr-10 tabular-nums`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base font-extrabold text-stone-500 dark:text-zinc-400">
                ₽
              </span>
            </div>
            {Number(amount) > 0 && (
              <p className="mt-1.5 text-[11px] font-medium text-stone-500 dark:text-zinc-400">
                На руки после налога {TAX_PERCENT}% — примерно{' '}
                {formatMoney(netOf(Number(amount)))}
              </p>
            )}
          </Field>

          <Field label="Скопировать на другие дни">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(presetNextWeeks(dateKey))}
                className={presetButtonClass}
              >
                +4 недели
              </button>
              <button
                type="button"
                onClick={() => applyPreset(presetMonthEnd(dateKey))}
                className={presetButtonClass}
              >
                До конца месяца
              </button>
              <button
                type="button"
                onClick={() => setIsPickerOpen((open) => !open)}
                aria-expanded={isPickerOpen}
                className={`${presetButtonClass} inline-flex items-center gap-1.5 ${
                  isPickerOpen
                    ? 'border-stone-500 text-stone-900 dark:border-white/40 dark:text-white'
                    : ''
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Вручную
              </button>
              {copyDates.size > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  {copyDates.size} дн.
                  <button
                    type="button"
                    onClick={() => setCopyDates(new Set())}
                    aria-label="Очистить выбор"
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-emerald-200/70 hover:text-emerald-900 dark:hover:bg-emerald-400/20 dark:hover:text-emerald-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            {isPickerOpen && (
              <CopyPicker
                anchorKey={dateKey}
                selectedSet={copyDates}
                onToggle={toggleCopyDate}
              />
            )}
          </Field>

          <Field label="Цвет карточки">
            <div className="flex flex-wrap gap-2 pt-0.5">
              {PALETTE.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={`Цвет: ${item.label}`}
                  onClick={() => setColor(item.id)}
                  className={`h-7 w-7 rounded-lg border transition-transform hover:scale-105 ${
                    color === item.id
                      ? 'ring-2 ring-stone-800 ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-zinc-900'
                      : ''
                  }`}
                  style={{
                    backgroundColor: isDark ? item.darkBg : item.bg,
                    borderColor: isDark ? item.darkBorder : item.border,
                  }}
                />
              ))}
            </div>
          </Field>

          <label className="flex cursor-pointer select-none items-center gap-2.5 py-1">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(event) => setIsPaid(event.target.checked)}
              className="peer sr-only"
            />
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-stone-300 bg-stone-50 transition-colors peer-checked:border-stone-900 peer-checked:bg-stone-900 peer-focus-visible:ring-2 peer-focus-visible:ring-stone-400 dark:border-white/20 dark:bg-white/5 dark:peer-checked:border-white dark:peer-checked:bg-white [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
              <Check className="h-3.5 w-3.5 stroke-[3] text-white dark:text-zinc-900" />
            </span>
            <span className="text-sm font-bold">Выплачено</span>
            <span className="ml-auto text-[11px] font-medium text-stone-400 dark:text-zinc-500">
              сумма уже пришла на счёт
            </span>
          </label>

          <label className="flex cursor-pointer select-none items-center gap-2.5 py-1"><input type="checkbox" checked={isGph} onChange={(event) => setIsGph(event.target.checked)} className="peer sr-only" /><span className="flex h-5 w-5 items-center justify-center rounded-md border border-stone-300 bg-stone-50 peer-checked:border-stone-900 peer-checked:bg-stone-900 dark:border-white/20 dark:bg-white/5 dark:peer-checked:border-white dark:peer-checked:bg-white [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"><Check className="h-3.5 w-3.5 text-white dark:text-zinc-900" /></span><span className="text-sm font-bold">Внесено в ГПХ</span><span className="ml-auto text-[11px] font-medium text-stone-400 dark:text-zinc-500">уже есть в договоре</span></label>

          <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-white/5">
            {isEdit ? (
              confirmDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-600 active:scale-[0.98]"
                >
                  Точно удалить?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Удалить проект"
                  title="Удалить проект"
                  className="rounded-xl p-2 text-rose-500 transition-colors hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={BTN_GHOST_CLASS}
              >
                Отмена
              </button>
<button type="submit" disabled={isSaving} aria-busy={isSaving} className={`${BTN_PRIMARY_CLASS} disabled:cursor-not-allowed disabled:opacity-60`}>
    {isSaving ? 'Сохраняем…' : 'Сохранить'}
  </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
