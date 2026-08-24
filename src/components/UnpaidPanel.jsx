import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { CARD_CLASS, getThemeDotColor } from '../constants';
import { formatLongDate } from '../dateUtils';
import { formatMoney } from '../finance';

const pad = (value) => String(value).padStart(2, '0');
const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const fromKey = (key) => { const [year, month, day] = key.split('-').map(Number); return new Date(year, month - 1, day); };
export default function UnpaidPanel({ items, onOpen, isDark, selectedKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [range, setRange] = useState({ from: '', to: '' });
  const [calendarMonth, setCalendarMonth] = useState(() => selectedKey ? fromKey(selectedKey) : new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const activeCalendarMonth = selectedKey && filter !== 'period' ? fromKey(selectedKey) : calendarMonth;

  const calendarDays = useMemo(() => {
    const first = new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth(), 1);
    const start = (first.getDay() + 6) % 7;
    const count = new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth() + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth(), index - start + 1);
      return { date, key: toKey(date), current: date.getMonth() === activeCalendarMonth.getMonth() };
    }).slice(0, Math.max(35, Math.ceil((start + count) / 7) * 7));
  }, [activeCalendarMonth]);

  const filteredItems = useMemo(() => items.filter((item) => {
    if (filter === 'projects' && item.type !== 'project') return false;
    if (filter === 'lessons' && item.type !== 'lesson') return false;
    if (filter === 'gph' && !(item.type === 'project' && item.isGph)) return false;
    if (filter === 'period' && (!range.from || !range.to || item.date < range.from || item.date > range.to)) return false;
    return true;
  }), [items, filter, range]);

  const selectDate = (key) => {
    if (!range.from || (range.from && range.to)) setRange({ from: key, to: '' });
    else setRange({ from: key < range.from ? key : range.from, to: key < range.from ? range.from : key });
    setFilter('period');
  };

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
          <div className="grid grid-cols-2 gap-1.5 border-t border-stone-100 px-4 py-2.5 sm:grid-cols-5 dark:border-white/5 sm:px-5">
            {[['all', 'Все'], ['projects', 'Проекты'], ['lessons', 'Уроки'], ['gph', 'Проекты в ГПХ'], ['period', range.from && range.to ? `${range.from.slice(8, 10)}.${range.from.slice(5, 7)}.${range.from.slice(0, 4)} — ${range.to.slice(8, 10)}.${range.to.slice(5, 7)}.${range.to.slice(0, 4)}` : 'Период']].map(([value, label]) => (
              <button key={value} type="button" onClick={() => { setFilter(value); if (value === 'period') setIsCalendarOpen(true); }} aria-pressed={filter === value} className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${filter === value ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white' : 'bg-stone-100 text-stone-500 hover:text-stone-900 dark:bg-white/[0.06] dark:text-zinc-400 dark:hover:text-white'}`}>{label}</button>
            ))}
          </div>
          {filter === 'period' && isCalendarOpen && <div className="mx-4 mb-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06] sm:mx-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <button type="button" onClick={() => setCalendarMonth(new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth() - 1, 1))} className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-400/10" aria-label="Предыдущий месяц"><ChevronLeft className="h-4 w-4" /></button>
              <div className="flex items-center gap-1.5">
                <select value={activeCalendarMonth.getMonth()} onChange={(event) => setCalendarMonth(new Date(activeCalendarMonth.getFullYear(), Number(event.target.value), 1))} aria-label="Выбрать месяц" className="max-w-[7.5rem] rounded-md border border-emerald-200 bg-transparent px-1 py-0.5 text-xs font-extrabold capitalize dark:border-emerald-400/20"><option value={0}>Январь</option><option value={1}>Февраль</option><option value={2}>Март</option><option value={3}>Апрель</option><option value={4}>Май</option><option value={5}>Июнь</option><option value={6}>Июль</option><option value={7}>Август</option><option value={8}>Сентябрь</option><option value={9}>Октябрь</option><option value={10}>Ноябрь</option><option value={11}>Декабрь</option></select>
                <select value={activeCalendarMonth.getFullYear()} onChange={(event) => setCalendarMonth(new Date(Number(event.target.value), activeCalendarMonth.getMonth(), 1))} aria-label="Выбрать год" className="max-w-[5.5rem] rounded-md border border-emerald-200 bg-transparent px-1 py-0.5 text-xs font-extrabold dark:border-emerald-400/20">{Array.from({ length: 31 }, (_, index) => activeCalendarMonth.getFullYear() - 15 + index).map((year) => <option key={year} value={year}>{year}</option>)}</select>
              </div>
              <button type="button" onClick={() => setCalendarMonth(new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth() + 1, 1))} className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-400/10" aria-label="Следующий месяц"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-emerald-700/70 dark:text-emerald-300/70">{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="mt-1 grid grid-cols-7 gap-1">{calendarDays.map(({ date, key, current }) => { const selected = key === range.from || key === range.to; const between = range.from && range.to && key > range.from && key < range.to; return <button key={key} type="button" onClick={() => selectDate(key)} className={`h-7 rounded-md text-[11px] font-semibold transition-colors ${!current ? 'text-emerald-900/25 dark:text-emerald-100/20' : 'text-emerald-950 dark:text-emerald-100'} ${between ? 'bg-emerald-200 dark:bg-emerald-400/20' : ''} ${selected ? 'bg-emerald-600 font-black text-white dark:bg-emerald-500' : 'hover:bg-emerald-100 dark:hover:bg-emerald-400/10'}`}>{date.getDate()}</button> })}</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              {(range.from || range.to) ? <button type="button" onClick={() => { setRange({ from: '', to: '' }); setFilter('all'); }} className="text-[11px] font-bold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300">Сбросить период</button> : <span />}
              <button type="button" onClick={() => { setIsCalendarOpen(false); }} className="rounded-md px-1.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-400/10" aria-label="Закрыть календарь периода">Закрыть</button>
            </div>
          </div>}
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
