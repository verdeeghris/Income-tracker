import { pluralize } from './constants';

// Утилиты для работы с датами. Везде используется строковый ключ «YYYY-MM-DD» —
// он стабильно сравнивается лексикографически и служит ключом хранения.

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const MONTHS_NOM = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

// Родительный падеж: «22 августа 2026»
export const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

// Именительный в нижнем регистре: «август 2026»
export const MONTHS_LOWER = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Полдень защищает от сдвигов через границы суток (DST, часовые пояса)
export function parseDateKey(key) {
  return new Date(`${key}T12:00:00`);
}

export function todayKey() {
  return formatDateKey(new Date());
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function addDays(key, amount) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + amount);
  return formatDateKey(date);
}

// Сдвиг на месяцы с аккуратным «прижатием» дня: 31 января + 1 месяц = 28/29 февраля,
// а не 3 марта (классический баг rollover).
export function addMonths(key, amount) {
  const date = parseDateKey(key);
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() + amount;
  const anchor = new Date(targetYear, targetMonth, 1);
  const day = Math.min(date.getDate(), daysInMonth(anchor.getFullYear(), anchor.getMonth()));
  return formatDateKey(new Date(anchor.getFullYear(), anchor.getMonth(), day));
}

export function shiftYears(key, amount) {
  const date = parseDateKey(key);
  const targetYear = date.getFullYear() + amount;
  const day = Math.min(date.getDate(), daysInMonth(targetYear, date.getMonth()));
  return formatDateKey(new Date(targetYear, date.getMonth(), day));
}

// «22 августа 2026»
export function formatLongDate(key) {
  const date = parseDateKey(key);
  return `${date.getDate()} ${MONTHS_GEN[date.getMonth()]} ${date.getFullYear()}`;
}

// «Август 2026»
export function formatMonthTitle(key) {
  const date = parseDateKey(key);
  return `${MONTHS_NOM[date.getMonth()]} ${date.getFullYear()}`;
}

// «17–23 августа 2026» / «28 сентября – 4 октября 2026» / через годовой стык
export function formatRange(fromKey, toKey) {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()) {
    return `${from.getDate()}–${to.getDate()} ${MONTHS_GEN[from.getMonth()]} ${from.getFullYear()}`;
  }
  if (from.getFullYear() === to.getFullYear()) {
    return `${from.getDate()} ${MONTHS_GEN[from.getMonth()]} – ${to.getDate()} ${MONTHS_GEN[to.getMonth()]} ${from.getFullYear()}`;
  }
  return `${formatLongDate(fromKey)} – ${formatLongDate(toKey)}`;
}

// Границы видимого периода для режима календаря
export function getPeriod(mode, key) {
  if (mode === 'day') {
    return { from: key, to: key };
  }
  const date = parseDateKey(key);
  if (mode === 'week') {
    const mondayOffset = (date.getDay() + 6) % 7;
    const from = formatDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset));
    return { from, to: addDays(from, 6) };
  }
  return {
    from: formatDateKey(new Date(date.getFullYear(), date.getMonth(), 1)),
    to: formatDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  };
}

// Человекочитаемая подпись периода для статистики
export function periodLabel(mode, key) {
  if (mode === 'day') return formatLongDate(key);
  if (mode === 'week') {
    const { from, to } = getPeriod('week', key);
    return formatRange(from, to);
  }
  return formatMonthTitle(key).toLowerCase();
}

// «1 проект» / «4 проекта» / «12 проектов»
export function pluralizeLabel(count, one = 'проект', few = 'проекта', many = 'проектов') {
  return `${count} ${pluralize(count, one, few, many)}`;
}

// Матрица месяца: массив недель по 7 ключей, всегда 6 строк —
// высота сетки не меняется от месяца к месяцу.
export function getMonthMatrix(year, monthIndex) {
  const firstDayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const totalCells = firstDayOffset + daysInMonth(year, monthIndex);
  const rows = Math.max(6, Math.ceil(totalCells / 7));
  const weeks = [];
  for (let row = 0; row < rows; row += 1) {
    const week = [];
    for (let col = 0; col < 7; col += 1) {
      const cellDate = new Date(year, monthIndex, 1 - firstDayOffset + row * 7 + col);
      week.push(formatDateKey(cellDate));
    }
    weeks.push(week);
  }
  return weeks;
}
