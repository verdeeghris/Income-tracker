import { useCallback, useEffect, useMemo, useState } from 'react'
import { LogOut, Moon, Sun } from 'lucide-react'
import Auth from './components/Auth'
import CalendarGrid from './components/CalendarGrid'
import DateBar from './components/DateBar'
import DayDetailsModal from './components/DayDetailsModal'
import ProjectModal from './components/ProjectModal'
import LessonModal from './components/LessonModal'
import StatsBar from './components/StatsBar'
import UnpaidPanel from './components/UnpaidPanel'
import { CARD_CLASS, TAX_PERCENT } from './constants'
import { getMonthMatrix, getPeriod, parseDateKey, periodLabel, todayKey } from './dateUtils'
import { computeStats } from './finance'
import { useTheme } from './hooks/useTheme'
import { supabase } from './supabaseClient'

const normalize = (row, type) => ({ ...row, type, date: type === 'lesson' ? row.lesson_date : row.start_date, amount: Number(row.amount) || 0, isPaid: row.is_paid === true, isGph: row.is_gph === true, instanceKey: `${type}_${row.id}_${type === 'lesson' ? row.lesson_date : row.start_date}` })
const groupByDate = (items) => items.reduce((map, item) => map.set(item.date, [...(map.get(item.date) || []), item]), new Map())

export default function App() {
  const [theme, setTheme] = useTheme(); const isDark = theme === 'dark'
  const [session, setSession] = useState(null); const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([]); const [lessons, setLessons] = useState([])
  const [selectedKey, setSelectedKey] = useState(todayKey()); const [mode, setMode] = useState('month')
  const [modal, setModal] = useState(null); const [dayDetailsKey, setDayDetailsKey] = useState(null); const [error, setError] = useState('')

  useEffect(() => { supabase.auth.getSession().then(({ data: { session: next } }) => { setSession(next); setLoading(false) }); const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next)); return () => subscription.unsubscribe() }, [])
  const fetchData = useCallback(async () => { if (!session?.user) return; const [p, l] = await Promise.all([supabase.from('projects').select('*').eq('user_id', session.user.id), supabase.from('lessons').select('*').eq('user_id', session.user.id)]); if (p.error || l.error) { setError('Не удалось загрузить данные. Попробуйте обновить страницу.'); return } setProjects((p.data || []).map((row) => normalize(row, 'project'))); setLessons((l.data || []).map((row) => normalize(row, 'lesson'))) }, [session])
  // Data loading is an external synchronization with Supabase.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (session) fetchData() }, [session, fetchData])
  // Restore the persisted calendar mode after the initial data load.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!projects.length && !lessons.length) setMode('day'); else { const saved = sessionStorage.getItem('gph_view_mode'); if (saved) setMode(saved) } }, [projects.length, lessons.length])
  const changeMode = (next) => { setMode(next); if (projects.length || lessons.length) sessionStorage.setItem('gph_view_mode', next) }
  const period = useMemo(() => getPeriod(mode, selectedKey), [mode, selectedKey]); const instances = useMemo(() => [...projects, ...lessons].filter((item) => item.date >= period.from && item.date <= period.to), [projects, lessons, period]); const byDate = useMemo(() => groupByDate(instances), [instances]); const stats = useMemo(() => computeStats(instances), [instances]); const selectedDate = parseDateKey(selectedKey); const weeks = useMemo(() => getMonthMatrix(selectedDate.getFullYear(), selectedDate.getMonth()), [selectedDate]);
  const templates = useMemo(() => { const seen = new Map(); [...projects, ...lessons].reverse().forEach((item) => { if (item.title && !seen.has(`${item.type}:${item.title}`)) seen.set(`${item.type}:${item.title}`, { type: item.type, title: item.title, color: item.color, amount: item.amount }) }); return [...seen.values()].slice(0, 8) }, [projects, lessons])
  const openCreate = useCallback((dateKey, type = 'project') => { setError(''); setModal({ type, instance: null, dateKey, key: Date.now() }) }, [])
  const openEdit = useCallback((instance) => { setError(''); setModal({ type: instance.type, instance, dateKey: instance.date, key: Date.now() }) }, [])
  const openDay = useCallback((dateKey) => { setError(''); setDayDetailsKey(dateKey) }, [])
  const handleSave = async (data) => { if (!session?.user || !modal) return; setError(''); const table = modal.type === 'lesson' ? 'lessons' : 'projects'; const dates = modal.instance ? [modal.dateKey] : [...new Set([modal.dateKey, ...(data.copyDates || [])])]; const payload = (date) => modal.type === 'lesson' ? { user_id: session.user.id, title: data.title, amount: data.amount, color: data.color, lesson_date: date, is_paid: data.isPaid } : { user_id: session.user.id, title: data.title, amount: data.amount, color: data.color, start_date: date, end_date: date, is_paid: data.isPaid, is_gph: data.isGph === true };
    const result = modal.instance ? await supabase.from(table).update(payload(modal.dateKey)).eq('id', modal.instance.id).eq('user_id', session.user.id).select('id').maybeSingle() : await supabase.from(table).insert(dates.map(payload)).select('id'); if (result.error) { setError(`Не удалось сохранить запись: ${result.error.message}`); return } if (modal.instance && !result.data) { setError('Запись не обновлена: Supabase не вернул строку. Проверьте user_id и RLS-политики.'); return } await fetchData(); setModal(null) }
  const handleDelete = async () => { if (!modal?.instance) return; const table = modal.type === 'lesson' ? 'lessons' : 'projects'; const result = await supabase.from(table).delete().eq('id', modal.instance.id).eq('user_id', session.user.id); if (result.error) { setError('Не удалось удалить запись.'); return } await fetchData(); setModal(null) }
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-stone-100 text-sm text-stone-500 dark:bg-zinc-900">Загрузка...</div>; if (!session) return <Auth />
  return <div className="min-h-screen font-sans text-stone-900 antialiased dark:text-zinc-100"><div className="mx-auto flex max-w-5xl flex-col gap-4 p-3 sm:gap-5 sm:p-6 lg:p-8"><header className="flex items-center justify-between pt-2"><div><h1 className="text-lg font-extrabold sm:text-xl">Трекер доходов</h1><p className="text-xs text-stone-500">{session.user.email}</p></div><div className="flex gap-2"><button type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Сменить тему" className="rounded-xl border border-stone-200 bg-[var(--card)] p-2 dark:border-white/10">{isDark ? <Sun /> : <Moon />}</button><button type="button" onClick={() => supabase.auth.signOut()} aria-label="Выйти" className="rounded-xl border border-stone-200 bg-[var(--card)] p-2 dark:border-white/10"><LogOut /></button></div></header>{error && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}<StatsBar stats={stats} periodLabelText={periodLabel(mode, selectedKey)} taxPercent={TAX_PERCENT} /><UnpaidPanel items={[...stats.unpaidList].sort((a, b) => a.date.localeCompare(b.date))} onOpen={openEdit} /><section className={`${CARD_CLASS} p-2.5 sm:p-5`}><DateBar mode={mode} onModeChange={changeMode} selectedKey={selectedKey} onChange={setSelectedKey} /><div className="mt-3 sm:mt-4"><CalendarGrid mode={mode} weeks={weeks} selectedKey={selectedKey} byDate={byDate} isDark={isDark} onSelectDay={openDay} onOpenInstance={openEdit} /></div></section><footer className="pb-3 text-center text-[11px] text-stone-400">Синхронизировано через Supabase · Налог {TAX_PERCENT}% учтён</footer></div>{dayDetailsKey && <DayDetailsModal dateKey={dayDetailsKey} instances={byDate.get(dayDetailsKey) || []} onClose={() => setDayDetailsKey(null)} onEdit={(item) => { setDayDetailsKey(null); openEdit(item) }} onAddProject={() => { setDayDetailsKey(null); openCreate(dayDetailsKey, 'project') }} onAddLesson={() => { setDayDetailsKey(null); openCreate(dayDetailsKey, 'lesson') }} />}{modal && (modal.type === 'lesson' ? <LessonModal key={modal.key} dateKey={modal.dateKey} instance={modal.instance} templates={templates} isDark={isDark} onClose={() => setModal(null)} onSave={handleSave} onDelete={handleDelete} /> : <ProjectModal key={modal.key} dateKey={modal.dateKey} instance={modal.instance} templates={templates} isDark={isDark} onClose={() => setModal(null)} onSave={handleSave} onDelete={handleDelete} />)}</div>
}
