const { test } = require('node:test');
const assert = require('node:assert/strict');
const { paymentIsOpen, cancellationSource, createPaymentDestination } = require('../services/orderPayment');

test('payment instructions are available only while payment is open', () => {
  const now = new Date('2026-09-12T12:00:00Z');
  assert.ok(paymentIsOpen({ status: 'pending', expiresAt: '2026-09-12T12:01:00Z' }, now));
  assert.ok(!paymentIsOpen({ status: 'pending', expiresAt: '2026-09-12T11:59:00Z' }, now));
  assert.ok(paymentIsOpen({ status: 'verifying', expiresAt: null }, now));
  for (const status of ['verified', 'processing', 'completed', 'rejected', 'cancelled', 'expired']) {
    assert.ok(!paymentIsOpen({ status, expiresAt: null }, now), status);
  }
});

test('destination is snapshotted from the configured method and network', () => {
  const method = { name: 'USDT TRC20', type: 'crypto', network: 'TRC20', receiverNumber: 'fallback', networks: [{ networkKey: 'TRC20', address: 'TRC-address', enabled: true }] };
  assert.deepEqual(createPaymentDestination(method, 'USDT_TRC20'), { methodName: 'USDT TRC20', type: 'crypto', network: 'TRC20', address: 'TRC-address' });
  assert.equal(createPaymentDestination({ name: 'Vodafone Cash', type: 'egp', receiverNumber: '01000000000' }, 'VODAFONE_CASH').address, '01000000000');
  assert.equal(createPaymentDestination({ name: 'Wallet', type: 'wallet' }, 'WALLET'), null);
});

test('customer and admin cancellations remain distinguishable', () => {
  assert.equal(cancellationSource({ cancelledBy: 'customer' }), 'customer');
  assert.equal(cancellationSource({ timeline: [{ status: 'cancelled', by: 'admin:example@test.com' }] }), 'admin');
  assert.equal(cancellationSource({ timeline: [{ status: 'cancelled', by: 'system' }] }), null);
});
