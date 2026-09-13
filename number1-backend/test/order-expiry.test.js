const test = require('node:test');
const assert = require('node:assert/strict');
const { parseOrderExpiryMins, getOrderExpiresAt } = require('../services/orderExpiry');

test('accepts positive whole-minute durations', () => {
  assert.equal(parseOrderExpiryMins(45), 45);
  assert.equal(parseOrderExpiryMins('60'), 60);
});

test('rejects invalid durations', () => {
  for (const value of [0, -1, 1.5, '2.5', '', 'abc', null, true, Number.MAX_SAFE_INTEGER]) {
    assert.equal(parseOrderExpiryMins(value), null, String(value));
  }
});

test('new order expiry uses the saved duration and keeps the default for missing settings', () => {
  const createdAt = Date.UTC(2026, 8, 13, 12);
  assert.equal(getOrderExpiresAt({ orderExpiryMins: 45 }, createdAt).getTime(), createdAt + 45 * 60_000);
  assert.equal(getOrderExpiresAt({}, createdAt).getTime(), createdAt + 30 * 60_000);
});
