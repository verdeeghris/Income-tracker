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

  const unpaidList = [];
  instances.forEach((instance) => {
    const amount = Number(instance.amount) || 0;
    grossTotal += amount;
    if (instance.isPaid) {
      paidGross += amount;
    } else {
      pendingGross += amount;
      unpaidList.push(instance);
    }
  });

  return {
    count: instances.length,
    grossTotal,
    paidGross,
    paidNet: netOf(paidGross),
    paidTax: taxOf(paidGross),
    pendingGross,
    pendingNet: netOf(pendingGross),
    pendingTax: taxOf(pendingGross),
    unpaidList,
  };
}
