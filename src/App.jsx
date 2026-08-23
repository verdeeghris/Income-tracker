import { useCallback, useEffect, useMemo, useState } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import Auth from './components/Auth';
import CalendarGrid from './components/CalendarGrid';
import DateBar from './components/DateBar';
import DayDetailsModal from './components/DayDetailsModal';
import ProjectModal from './components/ProjectModal';
import StatsBar from './components/StatsBar';
import UnpaidPanel from './components/UnpaidPanel';
import { CARD_CLASS, TAX_PERCENT } from './constants';
import { getMonthMatrix, getPeriod, parseDateKey, periodLabel, todayKey } from './dateUtils';
import { computeStats } from './finance';
import { useTheme } from './hooks/useTheme';
import { supabase } from './supabaseClient';

function expandInstances(projects, period, paidInstances) {
  const result = [];

  projects.forEach((project) => {
    if (project.date < period.from || project.date > period.to) return;
    const instanceKey = `${project.id}_${project.date}`;
    result.push({
      ...project,
      instanceKey,
      isPaid: paidInstances[instanceKey] ?? Boolean(project.isPaid),
    });
  });

  return result;
}

function groupByDate(instances) {
  const map = new Map();
  instances.forEach((instance) => {
    if (!map.has(instance.date)) map.set(instance.date, []);
    map.get(instance.date).push(instance);
  });
  return map;
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const isDark = theme === 'dark';

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [paidInstances, setPaidInstances] = useState({});

  const [selectedKey, setSelectedKey] = useState(todayKey());
  const [mode, setMode] = useState('month');
  const [modal, setModal] = useState(null);
  const [dayDetailsKey, setDayDetailsKey] = useState(null);

  // Слушаем статус авторизации
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Загрузка проектов текущего залогиненного пользователя
  const fetchProjects = useCallback(async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Ошибка загрузки:', error.message);
      return;
    }

    if (data) {
      const formatted = data.map((item) => ({
        id: item.id,
        title: item.title,
        amount: Number(item.amount),
        date: item.start_date,
        color: item.color,
      }));
      setProjects(formatted);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchProjects();
  }, [session, fetchProjects]);

  const period = useMemo(() => getPeriod(mode, selectedKey), [mode, selectedKey]);
  const instances = useMemo(
    () => expandInstances(projects, period, paidInstances),
    [projects, period, paidInstances]
  );
  const byDate = useMemo(() => groupByDate(instances), [instances]);
  const stats = useMemo(() => computeStats(instances), [instances]);

  const selectedDate = parseDateKey(selectedKey);
  const weeks = useMemo(
    () => getMonthMatrix(selectedDate.getFullYear(), selectedDate.getMonth()),
    [selectedDate.getFullYear(), selectedDate.getMonth()]
  );

  const unpaidSorted = useMemo(
    () => [...stats.unpaidList].sort((a, b) => a.date.localeCompare(b.date)),
    [stats.unpaidList]
  );

  const templates = useMemo(() => {
    const seen = new Map();
    [...projects].reverse().forEach((project) => {
      if (project.title && !seen.has(project.title)) {
        seen.set(project.title, { title: project.title, color: project.color, amount: project.amount });
      }
    });
    return Array.from(seen.values()).slice(0, 6);
  }, [projects]);

  const openCreate = useCallback((dateKey) => {
    setModal({ instance: null, dateKey, session: Date.now() });
  }, []);

  const openEdit = useCallback((instance) => {
    setModal({ instance, dateKey: instance.date, session: Date.now() });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const openDay = useCallback(
    (dateKey) => {
      if ((byDate.get(dateKey) || []).length > 0) {
        setDayDetailsKey(dateKey);
      } else {
        openCreate(dateKey);
      }
    },
    [byDate, openCreate]
  );

  const closeDayDetails = useCallback(() => setDayDetailsKey(null), []);

  const editFromDetails = useCallback(
    (instance) => {
      setDayDetailsKey(null);
      openEdit(instance);
    },
    [openEdit]
  );

  const addFromDetails = useCallback(() => {
    const dateKey = dayDetailsKey;
    setDayDetailsKey(null);
    if (dateKey) openCreate(dateKey);
  }, [dayDetailsKey, openCreate]);

  // Сохранение с привязкой к текущему user.id
  const handleSave = async ({ title, amount, color, isPaid, copyDates }) => {
    if (!session?.user) return;

    if (modal.instance) {
      const { id, instanceKey } = modal.instance;
      
      const { error } = await supabase
        .from('projects')
        .update({ title, amount, color, start_date: modal.dateKey, end_date: modal.dateKey })
        .eq('id', id);

      if (!error) {
        setPaidInstances((previous) => ({ ...previous, [instanceKey]: isPaid }));
        fetchProjects();
      }
    } else {
      const allDates = [modal.dateKey, ...copyDates];
      const rowsToInsert = allDates.map((d) => ({
        user_id: session.user.id,
        title,
        amount,
        color,
        start_date: d,
        end_date: d,
      }));

      const { error } = await supabase.from('projects').insert(rowsToInsert);

      if (!error) {
        fetchProjects();
      }
    }
    closeModal();
  };

  // Удаление
  const handleDelete = async () => {
    if (!modal?.instance) return;
    const { id } = modal.instance;

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (!error) {
        fetchProjects();
        closeModal();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm font-medium text-stone-500 bg-stone-100 dark:bg-zinc-900">
        Загрузка...
      </div>
    );
  }

  // Если пользователь не вошел — показываем экран авторизации/регистрации
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen font-sans text-stone-900 antialiased transition-colors duration-200 dark:text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-4 p-3 sm:space-y-5 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">Трекер доходов</h1>
            <p className="mt-0.5 text-xs font-medium text-stone-500 dark:text-zinc-400">
              {session.user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
              className="rounded-xl border border-stone-200 bg-[var(--card)] p-2 text-stone-600 shadow-sm transition-all hover:scale-105 hover:text-stone-900 dark:border-white/10 dark:text-zinc-300 dark:hover:text-white"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              title="Выйти из аккаунта"
              className="rounded-xl border border-stone-200 bg-[var(--card)] p-2 text-stone-600 shadow-sm transition-all hover:scale-105 hover:text-red-600 dark:border-white/10 dark:text-zinc-300 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <StatsBar stats={stats} periodLabelText={periodLabel(mode, selectedKey)} taxPercent={TAX_PERCENT} />

        <UnpaidPanel items={unpaidSorted} onOpen={openEdit} />

        <section className={`${CARD_CLASS} p-2.5 sm:p-5`}>
          <DateBar mode={mode} onModeChange={setMode} selectedKey={selectedKey} onChange={setSelectedKey} />
          <div key={mode} className="mt-3 animate-rise-in sm:mt-4">
            <CalendarGrid
              mode={mode}
              weeks={weeks}
              selectedKey={selectedKey}
              byDate={byDate}
              isDark={isDark}
              onSelectDay={openDay}
              onOpenProject={openEdit}
            />
          </div>
        </section>

        <footer className="pb-3 text-center text-[11px] font-medium text-stone-400 dark:text-zinc-600">
          Синхронизировано через Supabase · Налог {TAX_PERCENT}% учтён
        </footer>
      </div>

      {dayDetailsKey && (
        <DayDetailsModal
          dateKey={dayDetailsKey}
          instances={byDate.get(dayDetailsKey) || []}
          onClose={closeDayDetails}
          onEdit={editFromDetails}
          onAdd={addFromDetails}
        />
      )}

      {modal && (
        <ProjectModal
          key={modal.session}
          dateKey={modal.dateKey}
          instance={modal.instance}
          templates={templates}
          isDark={isDark}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}