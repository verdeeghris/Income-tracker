import { useEffect, useState } from 'react';

// Состояние, синхронизированное с localStorage.
// Чтение и запись обёрнуты в try/catch: в приватном режиме браузера
// localStorage может быть недоступен — приложение не должно падать.
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* игнорируем — данные просто не сохранятся */
    }
  }, [key, value]);

  return [value, setValue];
}
