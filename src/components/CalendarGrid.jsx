import { useState, useMemo } from 'react'
import { paletteOf, getThemeDotColor } from '../constants'
import { WEEKDAYS_SHORT, parseDateKey, todayKey } from '../dateUtils'
import { formatMoney } from '../finance'

const CELL_LIMITS = { day: Infinity, week: 6, month: 3 }
const DOT_LIMITS = { day: Infinity, week: 8, month: 4 }

function ProjectChip({ instance, isDark, onClick }) {
  const color = paletteOf(instance.color)

  return (
    <button
      type='button'
      title={`${instance.title} · ${formatMoney(instance.amount)}${instance.isPaid ? ' · выплачено' : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        onClick(instance)
      }}
      className={`flex w-full min-w-0 items-center justify-between gap-1 rounded-lg border px-2 py-1.5 text-left transition-colors duration-150 hover:brightness-95 dark:hover:brightness-110 ${
        instance.isPaid ? 'opacity-50' : ''
      }`}
      style={{
        backgroundColor: isDark ? color.darkBg : color.bg,
        borderColor: isDark ? color.darkBorder : color.border,
        color: isDark ? color.darkText : color.text,
      }}
    >
      <span
        className={`min-w-0 flex-1 truncate text-[11px] font-bold leading-4 ${instance.isPaid ? 'line-through' : ''}`}
      >
        {instance.title}
      </span>
      <span className='shrink-0 text-[10px] font-extrabold tabular-nums opacity-90'>
        {formatMoney(instance.amount)}
      </span>
    </button>
  )
}

function DayCell({
  dateKey,
  mode,
  selectedKey,
  instances,
  isExpanded,
  onToggleExpand,
  onSelectDay,
  onOpenInstance,
  isDark,
  dimmed,
}) {
  const date = parseDateKey(dateKey)
  const chipLimit = CELL_LIMITS[mode]
  const dotLimit = DOT_LIMITS[mode]
  const visibleChips =
    chipLimit === Infinity || isExpanded
      ? instances
      : instances.slice(0, chipLimit)
  const hiddenCount = instances.length - visibleChips.length
  const visibleDots =
    dotLimit === Infinity ? instances : instances.slice(0, dotLimit)
  const extraDots = instances.length - visibleDots.length
  const isToday = dateKey === todayKey()
  const isSelected = dateKey === selectedKey
  const projectCount = instances.filter((item) => item.type === 'project').length
  const lessonCount = instances.filter((item) => item.type === 'lesson').length
  const hasUnpaid = instances.some((item) => !item.isPaid)

  const cellClasses = [
    'group flex flex-col rounded-xl border p-1.5 text-left transition-colors duration-150 sm:p-2',
    dimmed ? 'cursor-default' : 'cursor-pointer hover:border-stone-400 hover:bg-stone-100 dark:hover:border-white/25 dark:hover:bg-white/[0.06]',
    isSelected
      ? 'border-stone-800 ring-1 ring-stone-800 dark:border-white dark:ring-white'
      : 'border-stone-200/80 dark:border-white/[0.07]',
    dimmed
      ? 'bg-stone-200/30 opacity-45 dark:bg-white/[0.02]'
      : 'bg-stone-100/40 dark:bg-white/[0.02]',
    mode === 'day'
      ? 'min-h-[220px] p-3 sm:p-4'
      : mode === 'week'
        ? 'min-h-[104px] sm:min-h-[170px]'
        : 'min-h-[68px] sm:min-h-[112px]',
  ].join(' ')

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={() => { if (!dimmed || instances.length > 0) onSelectDay(dateKey) }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          if (!dimmed || instances.length > 0) onSelectDay(dateKey)
        }
      }}
      className={cellClasses}
    >
      <div className='flex items-center justify-between'>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-extrabold tabular-nums sm:h-6 sm:w-6 sm:text-xs ${
            isToday
              ? 'bg-stone-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-stone-700 dark:text-zinc-300'
          }`}
        >
          {date.getDate()}
        </span>
        {hasUnpaid && (
          <span
            className='h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500'
            aria-label='Есть невыплаченные проекты'
          />
        )}
      </div>

      {mode === 'day' ? (
        <>
          <div className='mt-1 flex flex-wrap gap-x-2 text-[10px] font-semibold text-stone-500 dark:text-zinc-400'>
            <span>{projectCount} {projectCount === 1 ? 'проект' : projectCount >= 2 && projectCount <= 4 ? 'проекта' : 'проектов'}</span>
            <span>{lessonCount} {lessonCount === 1 ? 'урок' : lessonCount >= 2 && lessonCount <= 4 ? 'урока' : 'уроков'}</span>
          </div>
          <div className='mt-2.5 flex flex-col gap-1.5'>
          {instances.map((instance) => (
            <ProjectChip
              key={instance.instanceKey}
              instance={instance}
              isDark={isDark}
              onClick={onOpenInstance}
            />
          ))}
          </div>
        </>
      ) : (
        <div className='mt-1.5 flex flex-wrap items-center gap-1 sm:hidden'>
          {visibleDots.map((instance) => (
            <span
              key={instance.instanceKey}
              title={`${instance.title} · ${formatMoney(instance.amount)}`}
              className={`h-2.5 w-2.5 shrink-0 aspect-square rounded-full transition-colors duration-200 ${
                instance.isPaid ? 'opacity-40' : ''
              }`}
              style={{
                backgroundColor: getThemeDotColor(instance.color, isDark),
              }}
            />
          ))}
          {extraDots > 0 && (
            <span className='text-[9px] font-bold tabular-nums text-stone-400'>
              +{extraDots}
            </span>
          )}
        </div>
      )}

      <div
        className={`${mode === 'day' ? 'hidden' : 'hidden sm:flex'} mt-1.5 flex-col gap-1`}
      >
        {visibleChips.map((instance) => (
          <ProjectChip
            key={instance.instanceKey}
            instance={instance}
            isDark={isDark}
            onClick={onOpenInstance}
          />
        ))}

        {isExpanded ? (
          <button
            type='button'
            onClick={(event) => {
              event.stopPropagation()
              onToggleExpand(dateKey)
            }}
            className='mt-0.5 rounded-md px-1 py-0.5 text-left text-[10px] font-bold uppercase tracking-wide text-stone-400 transition-colors hover:text-stone-800 dark:text-zinc-500 dark:hover:text-zinc-100'
          >
            Свернуть
          </button>
        ) : hiddenCount > 0 ? (
          <button
            type='button'
            onClick={(event) => {
              event.stopPropagation()
              onToggleExpand(dateKey)
            }}
            className='mt-0.5 rounded-md px-1 py-0.5 text-left text-[10px] font-bold uppercase tracking-wide text-stone-400 transition-colors hover:text-stone-800 dark:text-zinc-500 dark:hover:text-zinc-100'
          >
            Ещё {hiddenCount}
          </button>
        ) : null}
      </div>

      {mode === 'day' && instances.length === 0 && (
        <div className='mt-3 flex flex-1 items-center justify-center rounded-xl border border-dashed border-stone-300 px-4 py-8 text-center text-xs font-medium text-stone-400 dark:border-white/10 dark:text-zinc-500'>
          Нет записей — нажмите, чтобы добавить
        </div>
      )}
    </div>
  )
}

export default function CalendarGrid({
  mode,
  weeks,
  selectedKey,
  byDate,
  isDark,
  onSelectDay,
  onOpenInstance,
}) {
  const [expandedDays, setExpandedDays] = useState(() => new Set())

  const toggleExpand = (dateKey) => {
    setExpandedDays((previous) => {
      const next = new Set(previous)
      if (next.has(dateKey)) next.delete(dateKey)
      else next.add(dateKey)
      return next
    })
  }

  const currentWeek = useMemo(
    () => weeks.find((week) => week.includes(selectedKey)) || weeks[0],
    [weeks, selectedKey],
  )

  const selectedMonth = parseDateKey(selectedKey).getMonth()

  return (
    <div
      key={`${mode}-${selectedKey}`}
      className='animate-view-switch transform-gpu'
    >
      {mode !== 'day' && (
        <div className='mb-1.5 grid grid-cols-7 gap-1 sm:mb-2 sm:gap-2'>
          {WEEKDAYS_SHORT.map((weekday) => (
            <div
              key={weekday}
              className='pb-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 sm:text-[10px]'
            >
              {weekday}
            </div>
          ))}
        </div>
      )}

      {mode === 'day' && (
        <DayCell
          dateKey={selectedKey}
          mode={mode}
          selectedKey={selectedKey}
          instances={byDate.get(selectedKey) || []}
          isExpanded={false}
          onToggleExpand={toggleExpand}
          onSelectDay={onSelectDay}
          onOpenInstance={onOpenInstance}
          isDark={isDark}
          dimmed={false}
        />
      )}

      {mode === 'week' && (
        <div className='grid grid-cols-7 gap-1 sm:gap-2'>
          {currentWeek.map((dateKey) => (
            <DayCell
              key={dateKey}
              dateKey={dateKey}
              mode={mode}
              selectedKey={selectedKey}
              instances={byDate.get(dateKey) || []}
              isExpanded={expandedDays.has(dateKey)}
              onToggleExpand={toggleExpand}
              onSelectDay={onSelectDay}
              onOpenInstance={onOpenInstance}
              isDark={isDark}
              dimmed={false}
            />
          ))}
        </div>
      )}

      {mode === 'month' && (
        <div className='flex flex-col gap-1 sm:gap-2'>
          {weeks.map((week) => (
            <div key={week[0]} className='grid grid-cols-7 gap-1 sm:gap-2'>
              {week.map((dateKey) => (
                <DayCell
                  key={dateKey}
                  dateKey={dateKey}
                  mode={mode}
                  selectedKey={selectedKey}
                  instances={byDate.get(dateKey) || []}
                  isExpanded={expandedDays.has(dateKey)}
                  onToggleExpand={toggleExpand}
                  onSelectDay={onSelectDay}
                  onOpenInstance={onOpenInstance}
                  isDark={isDark}
                  dimmed={parseDateKey(dateKey).getMonth() !== selectedMonth}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
