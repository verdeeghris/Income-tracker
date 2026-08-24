import { TAX_PERCENT } from './constants';

const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function formatMoney(value) {
  return rubles.format(Math.round(Number(value) || 0));
}

export function netOf(gross, taxPercent = TAX_PERCENT) {
  return gross * (1 - taxPercent / 100);
}

export function taxOf(gross, taxPercent = TAX_PERCENT) {
  return gross * (taxPercent / 100);
}

// Статистика по развёрнутым экземплярам проектов за видимый период.
// Все три блока считаются согласованно: гросс (по договору) и нетто (на руки)
// показываются раздельно, налог назван явно — без «магического вычитания».
export function computeStats(instances) {
  let grossTotal = 0;
  let paidGross = 0;
  let pendingGross = 0;
  let taxablePaidGross = 0;
  let taxablePendingGross = 0;
  let projectCount = 0;
  let lessonCount = 0;
  let projectPaidGross = 0;
  let lessonPaidGross = 0;
  let projectPendingGross = 0;
  let lessonPendingGross = 0;

  const unpaidList = [];
  instances.forEach((instance) => {
    const amount = Number(instance.amount) || 0;
    grossTotal += amount;
    const taxable = instance.type !== 'lesson';
    if (instance.type === 'lesson') lessonCount += 1;
    else projectCount += 1;
    if (instance.isPaid) {
      paidGross += amount;
      if (taxable) { taxablePaidGross += amount; projectPaidGross += amount; }
      else lessonPaidGross += amount;
    } else {
      pendingGross += amount;
      if (taxable) { taxablePendingGross += amount; projectPendingGross += amount; }
      else lessonPendingGross += amount;
      unpaidList.push(instance);
    }
  });

  return {
    count: instances.length,
    grossTotal,
    paidGross,
    paidNet: paidGross - taxOf(taxablePaidGross),
    paidTax: taxOf(taxablePaidGross),
    pendingGross,
    pendingNet: pendingGross - taxOf(taxablePendingGross),
    pendingTax: taxOf(taxablePendingGross),
    unpaidList,
    projectCount,
    lessonCount,
    projectPaidGross,
    lessonPaidGross,
    projectPendingGross,
    lessonPendingGross,
  };
}
