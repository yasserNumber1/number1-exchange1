// src/data/currencies.js
// المصدر الوحيد للعملات — IDs ثابتة لا تتغير أبداً
// ═══════════════════════════════════════════════════════════════

export const SEND_METHODS = [
  {
    id:     'vodafone',
    name:   'Vodafone Cash',
    symbol: 'EGP',
    type:   'egp',
    color:  '#e50000',
    img:    '/images/vodafone.png',
  },
  {
    id:     'instapay',
    name:   'InstaPay',
    symbol: 'EGP',
    type:   'egp',
    color:  '#6a0dad',
    img:    '/images/instapay.png',
  },
  {
    id:     'fawry',
    name:   'Fawry',
    symbol: 'EGP',
    type:   'egp',
    color:  '#f97316',
    img:    '/images/fawry.png',
  },
  {
    id:     'orange',
    name:   'Orange Cash',
    symbol: 'EGP',
    type:   'egp',
    color:  '#ff7700',
    img:    '/images/etisalat.png',
  },
  {
    id:     'usdt-trc',
    name:   'USDT TRC20',
    symbol: 'USDT',
    type:   'crypto',
    color:  '#26a17b',
    img:    '/images/usdt.png',
  },
  {
    id:     'mgo-send',
    name:   'MoneyGo USD',
    symbol: 'MGO',
    type:   'moneygo',
    color:  '#00c17c',
    img:    '/images/moneygo.png',
  },
  {
    id:     'wallet-usdt',
    name:   'محفظة داخلية',
    symbol: 'USDT',
    type:   'wallet',
    color:  '#378ADD',
    img:    null,
  },
]

export const RECEIVE_METHODS = [
  {
    id:          'mgo-recv',
    name:        'MoneyGo USD',
    symbol:      'MGO',
    type:        'moneygo',
    color:       '#00c17c',
    img:         '/images/moneygo.png',
    placeholder: 'U-XXXXXXXX',
  },
  {
    id:          'usdt-recv',
    name:        'USDT TRC20',
    symbol:      'USDT',
    type:        'crypto',
    color:       '#26a17b',
    img:         '/images/usdt.png',
    placeholder: 'T...',
  },
  {
    id:          'wallet-recv',
    name:        'محفظة داخلية',
    symbol:      'USDT',
    type:        'wallet',
    color:       '#378ADD',
    img:         null,
    placeholder: '',
  },
]

// ── RATES_DATA — بيانات أسعار العملات لصفحة Rates ──────────
export const RATES_DATA = [
  { symbol: 'USDT', name: 'Tether USD',  price: 1.000,    change: 0.01 },
  { symbol: 'BTC',  name: 'Bitcoin',     price: 67420.00, change: 1.24 },
  { symbol: 'ETH',  name: 'Ethereum',    price: 3512.50,  change: 0.87 },
  { symbol: 'BNB',  name: 'BNB',         price: 598.30,   change: 0.54 },
  { symbol: 'SOL',  name: 'Solana',      price: 172.40,   change: 2.11 },
  { symbol: 'TON',  name: 'Toncoin',     price: 7.85,     change: 1.43 },
  { symbol: 'XRP',  name: 'XRP',         price: 0.6210,   change: 0.33 },
  { symbol: 'ADA',  name: 'Cardano',     price: 0.4530,   change: 0.72 },
  { symbol: 'LTC',  name: 'Litecoin',    price: 84.20,    change: 0.45 },
  { symbol: 'MGO',  name: 'MoneyGo USD', price: 1.000,    change: 0.00 },
]