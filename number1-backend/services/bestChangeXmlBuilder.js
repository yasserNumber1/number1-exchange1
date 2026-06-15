// services/bestChangeXmlBuilder.js

// Keep this mapping easy to edit as BestChange codes are verified.
const BESTCHANGE_CODE_MAP = {
  USDT: 'USDTTRC20',
  MGO: 'MNGUSD',
};

const DEFAULTS = {
  availableUsdt: 10000,
  availableMgo: 10000,
  minUsdt: 10,
  minMgo: 10,
  maxUsdt: 10000,
  maxMgo: 10000,
};

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampPositive(value, fallback = 1) {
  const n = num(value, fallback);
  return n > 0 ? n : fallback;
}

function roundAmount(value, digits = 8) {
  return Number(clampPositive(value, 0).toFixed(digits));
}

function getCurrencyGroup(code) {
  if (!code || typeof code !== 'string') return 'UNKNOWN';
  if (code === 'USDT') return 'USDT';
  if (code === 'MGO') return 'MGO';
  return 'UNKNOWN';
}

function resolveLiquidity(rateDoc) {
  return {
    USDT: {
      min: clampPositive(rateDoc?.minUsdt || rateDoc?.minOrderUsdt, DEFAULTS.minUsdt),
      max: clampPositive(rateDoc?.availableUsdt ?? rateDoc?.maxUsdt, DEFAULTS.maxUsdt),
    },
    MGO: {
      min: clampPositive(rateDoc?.minMgo, DEFAULTS.minMgo),
      max: clampPositive(rateDoc?.availableMgo ?? rateDoc?.maxMgo, DEFAULTS.maxMgo),
    },
  };
}

function resolvePairAmounts(rateDoc, fromGroup, toGroup) {
  const fromLiquidity = resolveLiquidity(rateDoc)[fromGroup];
  const toLiquidity = resolveLiquidity(rateDoc)[toGroup];

  return {
    reserveAmount: roundAmount(clampPositive(toLiquidity?.max, 0), 2),
    minAmount: roundAmount(clampPositive(fromLiquidity?.min, 0), 2),
    maxAmount: roundAmount(clampPositive(fromLiquidity?.max, 0), 2),
  };
}

function buildItemXml({ fromCode, toCode, inAmount, outAmount, reserveAmount, minAmount, maxAmount }) {
  return [
    '  <item>',
    `    <from>${xmlEscape(fromCode)}</from>`,
    `    <to>${xmlEscape(toCode)}</to>`,
    `    <in>${xmlEscape(inAmount)}</in>`,
    `    <out>${xmlEscape(outAmount)}</out>`,
    `    <amount>${xmlEscape(reserveAmount)}</amount>`,
    `    <minamount>${xmlEscape(minAmount)}</minamount>`,
    `    <maxamount>${xmlEscape(maxAmount)}</maxamount>`,
    '  </item>',
  ].join('\n');
}

function buildBestChangeXML(rateDoc) {
  const pairs = Array.isArray(rateDoc?.pairs) ? rateDoc.pairs : [];
  const available = resolveLiquidity(rateDoc);

  const items = [];

  for (const pair of pairs) {
    if (!pair || pair.enabled !== true) continue;
    if (!(pair.from === 'USDT' && pair.to === 'MGO')) continue;

    const fromKey = pair.from;
    const toKey = pair.to;

    const mappedFrom = BESTCHANGE_CODE_MAP[fromKey];
    const mappedTo = BESTCHANGE_CODE_MAP[toKey];
    if (!mappedFrom || !mappedTo) continue;

    const fromGroup = getCurrencyGroup(fromKey);
    const toGroup = getCurrencyGroup(toKey);
    if (fromGroup === 'UNKNOWN' || toGroup === 'UNKNOWN') continue;

    const buyRate = num(pair.buyRate, 0);
    const sellRate = num(pair.sellRate, 0);
    if (buyRate <= 0 && sellRate <= 0) continue;

    const directOut = buyRate > 0 ? buyRate : sellRate;

    if (directOut > 0) {
      const { reserveAmount, minAmount, maxAmount } = resolvePairAmounts(rateDoc, fromGroup, toGroup);
      items.push(
        buildItemXml({
          fromCode: mappedFrom,
          toCode: mappedTo,
          inAmount: 1,
          outAmount: roundAmount(directOut),
          reserveAmount,
          minAmount,
          maxAmount,
        })
      );
    }

  }

  return ['<?xml version="1.0" encoding="UTF-8"?>', '<rates>', ...items, '</rates>'].join('\n');
}

module.exports = {
  buildBestChangeXML,
  BESTCHANGE_CODE_MAP,
};
