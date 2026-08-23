import { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, KeyRound, Mail, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { BTN_PRIMARY_CLASS, INPUT_CLASS } from '../constants';

function translateError(message) {
  if (!message) return 'Произошла неизвестная ошибка';
  if (message.includes('Invalid login credentials')) {
    return 'Неверный email или пароль. Проверьте данные или зарегистрируйтесь.';
  }
  if (message.includes('User already registered')) {
    return 'Пользователь с таким email уже зарегистрирован. Попробуйте войти.';
  }
  if (message.includes('Password should be at least')) {
    return 'Пароль должен содержать минимум 6 символов.';
  }
  if (message.includes('Unable to validate email address')) {
    return 'Укажите корректный адрес электронной почты.';
  }
  if (message.includes('Email rate limit exceeded')) {
    return 'Слишком много запросов. Подождите пару минут и попробуйте снова.';
  }
  return message;
}

// Оценка надежности пароля
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'bg-stone-200' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Слабый', color: 'bg-red-500' };
  if (score === 2 || score === 3) return { score: 2, label: 'Нормальный', color: 'bg-amber-500' };
  return { score: 3, label: 'Надежный', color: 'bg-emerald-500' };
}

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const strength = getPasswordStrength(password);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    if (view === 'forgot') {
      setStatus('Отправка инструкции...');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setError(translateError(error.message));
        setStatus(null);
      } else {
        setStatus('Инструкция по сбросу пароля отправлена на почту.');
      }
      setLoading(false);
      return;
    }

    if (view === 'signup') {
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        setLoading(false);
        return;
      }
      setStatus('Создание аккаунта...');
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError(translateError(error.message));
        setStatus(null);
      } else if (data.user && data.session === null) {
        setStatus('Регистрация успешна! Проверьте почту для подтверждения.');
      } else {
        setStatus('Аккаунт успешно создан! Входим...');
      }
    } else {
      setStatus('Вход в систему...');
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(translateError(error.message));
        setStatus(null);
      } else {
        setStatus('Успешный вход! Загрузка данных...');
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-4 dark:bg-zinc-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-800 transition-all">
        <h2 className="mb-1 text-xl font-bold text-stone-900 dark:text-white">
          {view === 'login' && 'Вход в систему'}
          {view === 'signup' && 'Регистрация'}
          {view === 'forgot' && 'Сброс пароля'}
        </h2>
        <p className="mb-6 text-xs text-stone-500 dark:text-zinc-400">
          {view === 'forgot' 
            ? 'Введите email, указанный при регистрации' 
            : 'Ваши финансовые данные надежно изолированы'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-zinc-300">
              Электронная почта
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                className={`${INPUT_CLASS} pl-9`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {view !== 'forgot' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-zinc-300">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={view === 'signup' ? 'Минимум 6 символов' : '••••••••'}
                  className={`${INPUT_CLASS} pl-9 pr-10`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
                  tabIndex={-1}
                  title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              {/* Индикатор надежности пароля при регистрации */}
              {view === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1 w-full bg-stone-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className={`transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.score / 3) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>Надежность:</span>
                    <span className="font-medium">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Подтверждение пароля при регистрации */}
          {view === 'signup' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-zinc-300">
                Подтвердите пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Повторите пароль"
                  className={`${INPUT_CLASS} pl-9`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Ссылка Забыли пароль (только для входа) */}
          {view === 'login' && (
            <div className="flex justify-end text-xs">
              <button
                type="button"
                onClick={() => { setView('forgot'); setError(null); setStatus(null); }}
                className="text-stone-500 hover:underline dark:text-zinc-400"
              >
                Забыли пароль?
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {status && !error && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              <span>{status}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 ${BTN_PRIMARY_CLASS}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {view === 'login' && 'Войти'}
            {view === 'signup' && 'Создать аккаунт'}
            {view === 'forgot' && 'Отправить инструкции'}
          </button>
        </form>

        {/* Навигация между экранами */}
        <div className="mt-4 text-center text-xs text-stone-500 dark:text-zinc-400">
          {view === 'login' && (
            <button
              type="button"
              onClick={() => { setView('signup'); setError(null); setStatus(null); }}
              className="hover:underline font-medium text-stone-700 dark:text-zinc-200"
            >
              Нет аккаунта? Зарегистрироваться
            </button>
          )}
          {view === 'signup' && (
            <button
              type="button"
              onClick={() => { setView('login'); setError(null); setStatus(null); }}
              className="hover:underline font-medium text-stone-700 dark:text-zinc-200"
            >
              Уже есть аккаунт? Войти
            </button>
          )}
          {view === 'forgot' && (
            <button
              type="button"
              onClick={() => { setView('login'); setError(null); setStatus(null); }}
              className="hover:underline font-medium text-stone-700 dark:text-zinc-200"
            >
              Вернуться ко входу
            </button>
          )}
        </div>
      </div>
    </div>
  );
}