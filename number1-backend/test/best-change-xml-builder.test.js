const test = require('node:test');
const assert = require('node:assert/strict');

const { buildBestChangeXML } = require('../services/bestChangeXmlBuilder');

test('exports the USDT and MoneyGo rate in both directions', () => {
  const xml = buildBestChangeXML({
    pairs: [
      {
        from: 'USDT',
        to: 'MGO',
        buyRate: 0.9,
        sellRate: 1.05,
        enabled: true,
      },
    ],
    minUsdt: 10,
    minMgo: 20,
    availableUsdt: 18487.12,
    availableMgo: 300,
  });

  assert.match(xml, /<from>USDTTRC20<\/from>\s+<to>MNGUSD<\/to>\s+<in>1<\/in>\s+<out>0\.9<\/out>\s+<amount>300<\/amount>\s+<minamount>10<\/minamount>\s+<maxamount>18487\.12<\/maxamount>/);
  assert.match(xml, /<from>MNGUSD<\/from>\s+<to>USDTTRC20<\/to>\s+<in>1<\/in>\s+<out>1\.05<\/out>\s+<amount>18487\.12<\/amount>\s+<minamount>20<\/minamount>\s+<maxamount>300<\/maxamount>/);
  assert.equal((xml.match(/<item>/g) || []).length, 2);
});

test('omits a direction that does not have a positive configured rate', () => {
  const xml = buildBestChangeXML({
    pairs: [
      {
        from: 'USDT',
        to: 'MGO',
        buyRate: 0.9,
        sellRate: 0,
        enabled: true,
      },
    ],
  });

  assert.match(xml, /<from>USDTTRC20<\/from>/);
  assert.doesNotMatch(xml, /<from>MNGUSD<\/from>/);
  assert.equal((xml.match(/<item>/g) || []).length, 1);
});
