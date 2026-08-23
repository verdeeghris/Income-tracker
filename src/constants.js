export const STORAGE_KEYS = {
  theme: 'gph_theme_v2',
  projects: 'gph_projects_v2',
  paidInstances: 'gph_paid_instances_v2',
};

export const TAX_PERCENT = 13;
export const MIN_YEAR = 1000;
export const MAX_YEAR = 9999;
export const MAX_COPIES = 62;

export const PALETTE = [
  { 
    id: 'red', 
    label: 'Алый', 
    bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', dot: '#DC2626',
    darkBg: '#450A0A', darkText: '#FECDD3', darkBorder: '#991B1B', darkDot: '#F87171' 
  },
  { 
    id: 'blue', 
    label: 'Синий', 
    bg: '#E0F2FE', text: '#075985', border: '#7DD3FC', dot: '#0284C7',
    darkBg: '#0C4A6E', darkText: '#E0F2FE', darkBorder: '#0369A1', darkDot: '#38BDF8' 
  },
  { 
    id: 'emerald', 
    label: 'Изумруд', 
    bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', dot: '#059669',
    darkBg: '#064E3B', darkText: '#D1FAE5', darkBorder: '#047857', darkDot: '#34D399' 
  },
  { 
    id: 'amber', 
    label: 'Жёлтый', 
    bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', dot: '#D97706',
    darkBg: '#451A03', darkText: '#FEF3C7', darkBorder: '#B45309', darkDot: '#FBBF24' 
  },
  { 
    id: 'purple', 
    label: 'Фиолетовый', 
    bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE', dot: '#9333EA',
    darkBg: '#3B0764', darkText: '#F3E8FF', darkBorder: '#7E22CE', darkDot: '#C084FC' 
  },
  { 
    id: 'orange', 
    label: 'Оранжевый', 
    bg: '#FFEDD5', text: '#9A3412', border: '#FDBA74', dot: '#EA580C',
    darkBg: '#431407', darkText: '#FFEDD5', darkBorder: '#C2410C', darkDot: '#FB923C' 
  },
  { 
    id: 'cyan', 
    label: 'Бирюзовый', 
    bg: '#CFFAFE', text: '#155E75', border: '#67E8F9', dot: '#0891B2',
    darkBg: '#083344', darkText: '#CFFAFE', darkBorder: '#0E7490', darkDot: '#22D3EE' 
  },
  { 
    id: 'slate', 
    label: 'Серый', 
    bg: '#F1F5F9', text: '#334155', border: '#CBD5E1', dot: '#475569',
    darkBg: '#1E293B', darkText: '#F8FAFC', darkBorder: '#475569', darkDot: '#94A3B8' 
  },
];

export function paletteOf(colorId) {
  return PALETTE.find((item) => item.id === colorId) || PALETTE[0];
}

export function getThemeDotColor(colorId, isDark) {
  const p = paletteOf(colorId);
  return isDark ? p.darkDot : p.dot;
}

export function pluralize(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
  return many;
}

export const CARD_CLASS =
  'rounded-2xl border border-stone-200/80 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[var(--card)] transition-all duration-200';

export const INPUT_CLASS =
  'w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium outline-none transition-colors placeholder:font-normal focus:border-stone-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:focus:border-white/30 dark:focus:bg-white/[0.07]';

export const BTN_PRIMARY_CLASS =
  'rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200';

export const BTN_GHOST_CLASS =
  'rounded-xl px-3 py-2 text-xs font-bold text-stone-500 transition-colors hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5';