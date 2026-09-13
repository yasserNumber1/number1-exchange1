const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidMoneyGoWalletId } = require('../services/moneygoWalletId');
const walletRouter = require('../routes/wallet');

test('MoneyGo IDs require uppercase U- and a non-space suffix', () => {
  for (const id of ['U-1', 'U-ABC123', ' U-ABC123 ']) assert.equal(isValidMoneyGoWalletId(id), true);
  for (const id of ['', 'U-', 'u-123', 'A-123', 'U-A B', null, 123]) assert.equal(isValidMoneyGoWalletId(id), false);
});

test('wallet transfer rejects a bad MoneyGo ID before a debit', async () => {
  const route = walletRouter.stack.find(layer => layer.route?.path === '/transfer-to-moneygo');
  const handler = route.route.stack[0].handle;
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this }, json(body) { this.body = body; return this } };
  await handler({ body: { amount: 10, recipientId: 'ABC123' } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /U-/);
});
