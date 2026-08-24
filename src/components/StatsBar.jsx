import { CARD_CLASS } from '../constants';
import { formatMoney } from '../finance';

function StatCard({ label, value, sub }) {
  return (
    <div className={`${CARD_CLASS} flex h-full min-h-[128px] flex-col p-4 sm:p-5`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">{label}</div>
      <div className="mt-1.5 text-xl font-extrabold tabular-nums tracking-tight sm:text-2xl">{value}</div>
      {sub && <div className="mt-auto pt-2 text-[11px] leading-snug text-stone-500 dark:text-zinc-400">{sub}</div>}
    </div>
  );
}

// Три согласованных блока статистики за видимый период календаря:
// сколько написано в договорах, сколько получено на руки и что ещё ожидается.
export default function StatsBar({ stats, periodLabelText, taxPercent }) {
  const paidDetails = [
    stats.projectPaidGross > 0 && `Проекты после налога ${taxPercent}%`,
    stats.lessonPaidGross > 0 && 'Уроки без налога',
  ].filter(Boolean).join(' · ')
  const pendingDetails = [
    stats.projectPendingGross > 0 && `Проекты после налога ${taxPercent}%`,
    stats.lessonPendingGross > 0 && 'Уроки без налога',
  ].filter(Boolean).join(' · ')

  return (
    <section aria-label="Статистика за период" className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
      <StatCard
        label="По договорам"
        value={formatMoney(stats.grossTotal)}
        sub={`${stats.projectCount} проект${stats.projectCount === 1 ? '' : 'ов'} · ${stats.lessonCount} урок${stats.lessonCount === 1 ? '' : 'ов'} · ${periodLabelText}`}
      />
      <StatCard
        label="Получено на руки"
        value={formatMoney(stats.paidNet)}
        sub={paidDetails ? `${paidDetails} · ${formatMoney(stats.paidGross)} по договорам` : 'Нет оплаченных записей'}
      />
      <StatCard
        label="Ожидается к выплате"
        value={formatMoney(stats.pendingNet)}
        sub={pendingDetails ? `${pendingDetails} · ${formatMoney(stats.pendingGross)} по договорам` : 'Нет записей к выплате'}
      />
    </section>
  );
}
