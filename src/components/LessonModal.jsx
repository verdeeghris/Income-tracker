import { useEffect, useState } from 'react'
import { Check, Copy, X } from 'lucide-react'
import { BTN_GHOST_CLASS, BTN_PRIMARY_CLASS, INPUT_CLASS, PALETTE, paletteOf } from '../constants'
import { formatLongDate } from '../dateUtils'

export default function LessonModal({ dateKey, instance, templates = [], isDark, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(instance?.title || '')
  const [amount, setAmount] = useState(instance?.amount ? String(instance.amount) : '')
  const [color, setColor] = useState(instance?.color || PALETTE[0].id)
  const [isPaid, setIsPaid] = useState(Boolean(instance?.isPaid))

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKeyDown) }
  }, [onClose])

  const submit = (event) => {
    event.preventDefault()
    const parsed = Number(amount)
    if (!title.trim() || !Number.isFinite(parsed) || parsed <= 0) return
    onSave({ title: title.trim(), amount: parsed, color, isPaid })
  }

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-sheet' onClick={(event) => event.stopPropagation()}>
        <div className='mb-4 flex items-start justify-between gap-3'><div><h2 className='text-base font-extrabold'>{instance ? 'Редактировать урок' : 'Новый урок'}</h2><p className='mt-0.5 text-xs text-stone-500 dark:text-zinc-400'>{formatLongDate(dateKey)} · без налога</p></div><button type='button' onClick={onClose} aria-label='Закрыть' className='rounded-lg p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5'><X className='h-4 w-4' /></button></div>
        <form onSubmit={submit} className='flex flex-col gap-4'>
          {!instance && templates.length > 0 && <div><label className='mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-400'>Пресеты уроков</label><div className='flex gap-1.5 overflow-x-auto p-1 scrollbar-none'>{templates.map((template, index) => { const c = paletteOf(template.color); return <button key={`${template.title}-${index}`} type='button' onClick={() => { setTitle(template.title); setAmount(String(template.amount)); setColor(template.color) }} className='shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold' style={{ backgroundColor: isDark ? c.darkBg : c.bg, borderColor: isDark ? c.darkBorder : c.border, color: isDark ? c.darkText : c.text }}>{template.title}<Copy className='ml-1 inline h-3 w-3' /></button> })}</div></div>}
          <label className='flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400'>Название урока<input required maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} placeholder='Например, консультация' className={INPUT_CLASS} /></label>
          <label className='flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400'>Оплата<input required inputMode='decimal' value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, '').slice(0, 9))} placeholder='3 500' className={INPUT_CLASS} /><span className='normal-case tracking-normal text-stone-500 dark:text-zinc-400'>Уроки не облагаются налогом: сумма учитывается полностью.</span></label>
          <div><label className='mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-400'>Цвет</label><div className='flex flex-wrap gap-2'>{PALETTE.map((item) => <button key={item.id} type='button' aria-label={`Цвет: ${item.label}`} onClick={() => setColor(item.id)} className={`size-8 rounded-lg border ${color === item.id ? 'ring-2 ring-stone-800 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900' : ''}`} style={{ backgroundColor: isDark ? item.darkBg : item.bg, borderColor: isDark ? item.darkBorder : item.border }} />)}</div></div>
          <label className='flex min-h-11 cursor-pointer items-center gap-2.5'><input type='checkbox' checked={isPaid} onChange={(event) => setIsPaid(event.target.checked)} className='peer sr-only' /><span className='flex size-5 items-center justify-center rounded-md border border-stone-300 bg-stone-50 peer-checked:border-stone-900 peer-checked:bg-stone-900 dark:border-white/20 dark:bg-white/5 dark:peer-checked:border-white dark:peer-checked:bg-white'><Check className='size-3.5 text-white opacity-0 peer-checked:opacity-100 dark:text-zinc-900' /></span><span className='text-sm font-bold'>Выплачено</span></label>
          <div className='flex justify-end gap-2 border-t border-stone-100 pt-4 dark:border-white/5'>{instance && <button type='button' onClick={onDelete} className='mr-auto rounded-xl px-3 py-2 text-xs font-bold text-rose-500'>Удалить</button>}<button type='button' onClick={onClose} className={BTN_GHOST_CLASS}>Отмена</button><button type='submit' className={BTN_PRIMARY_CLASS}>Сохранить</button></div>
        </form>
      </div>
    </div>
  )
}
