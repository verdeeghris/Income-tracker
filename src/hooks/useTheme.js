import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants';

// Единый источник правды для темы: класс «dark» на <html> управляет
// и Tailwind-вариантами (darkMode: 'class'), и CSS-переменными в index.css.
export function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.theme);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* недоступен localStorage — смотрим системную тему */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemeClass(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyThemeClass(theme);
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      /* игнорируем */
    }
  }, [theme]);

  return [theme, setTheme];
}
