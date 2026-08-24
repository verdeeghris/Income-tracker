import { CARD_CLASS } from '../constants';
import { pluralizeLabel } from '../dateUtils';
import { formatMoney } from '../finance';

function StatCard({ label, value, sub }) {
  return (
    <div className={`${CARD_CLASS} p-4 sm:p-5`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">{label}</div>
      <div className="mt-1.5 text-xl font-extrabold tabular-nums tracking-tight sm:text-2xl">{value}</div>
      {sub && <div className="mt-1 text-[11px] leading-snug text-stone-500 dark:text-zinc-400">{sub}</div>}
    </div>
  );
}

// Три согласованных блока статистики за видимый период календаря:
// сколько написано в договорах, сколько получено на руки и что ещё ожидается.
export default function StatsBar({ stats, periodLabelText, taxPercent }) {
  return (
    <section aria-label="Статистика за период" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        label="По договорам"
        value={formatMoney(stats.grossTotal)}
        sub={`${pluralizeLabel(stats.count)} · ${periodLabelText}`}
      />
      <StatCard
        label="Получено на руки"
        value={formatMoney(stats.paidNet)}
        sub={`после налога ${taxPercent}% · в договорах ${formatMoney(stats.paidGross)}`}
      />
      <StatCard
        label="Ожидается к выплате"
        value={formatMoney(stats.pendingNet)}
        sub={`после налога ${taxPercent}% · в договорах ${formatMoney(stats.pendingGross)}`}
      />
    </section>
  );
}
