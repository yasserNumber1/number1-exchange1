const test = require('node:test');
const assert = require('node:assert/strict');
const Setting = require('../models/Setting');
const router = require('../routes/admin');
const routes = router.stack.filter(x => x.route?.path === '/settings');
const get = routes.find(x => x.route.methods.get).route.stack[0].handle;
const put = routes.find(x => x.route.methods.put).route.stack[0].handle;
const res = () => ({ statusCode: 200, status(n) { this.statusCode = n; return this }, json(data) { this.data = data; return this } });

test('expiry saves, reloads, accepts legacy alias, rejects invalid values', async () => {
  const oldGet = Setting.getSingleton, oldPut = Setting.findOneAndUpdate;
  let minutes = 30, writes = 0;
  Setting.getSingleton = async () => ({ toObject: () => ({ orderExpiryMins: minutes }) });
  Setting.findOneAndUpdate = async (_filter, update) => {
    writes++;
    minutes = update.$set.orderExpiryMins;
    return { toObject: () => ({ orderExpiryMins: minutes }) };
  };
  try {
    const saved = res();
    await put({ body: { orderExpiryMins: 45 } }, saved);
    assert.equal(saved.data.orderExpiryMins, 45);
    const reloaded = res();
    await get({}, reloaded);
    assert.equal(reloaded.data.orderExpiryMinutes, 45);
    const legacy = res();
    await put({ body: { orderExpiryMins: 45, orderExpiryMinutes: 50 } }, legacy);
    assert.equal(legacy.data.orderExpiryMins, 50);
    for (const value of [0, -1, 1.5, 'bad', null]) {
      const invalid = res();
      await put({ body: { orderExpiryMins: value } }, invalid);
      assert.equal(invalid.statusCode, 400);
      assert.equal(minutes, 50);
    }
    assert.equal(writes, 2);
  } finally {
    Setting.getSingleton = oldGet;
    Setting.findOneAndUpdate = oldPut;
  }
});
