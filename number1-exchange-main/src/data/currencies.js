// src/data/currencies.js

export const RATES_DATA = [
  { name:'Bitcoin',  symbol:'BTC',  price:67420.5, change:2.4,  up:true  },
  { name:'Ethereum', symbol:'ETH',  price:3840.2,  change:0.8,  up:false },
  { name:'USDT',     symbol:'USDT', price:1.0,     change:0.01, up:true  },
  { name:'MoneyGo',  symbol:'MGO',  price:0.994,   change:0.1,  up:true  },
  { name:'BNB',      symbol:'BNB',  price:580.4,   change:1.2,  up:true  },
  { name:'Toncoin',  symbol:'TON',  price:6.84,    change:3.5,  up:true  },
  { name:'Litecoin', symbol:'LTC',  price:84.2,    change:1.1,  up:false },
  { name:'XRP',      symbol:'XRP',  price:0.584,   change:4.2,  up:true  },
  { name:'Solana',   symbol:'SOL',  price:186.4,   change:2.1,  up:true  },
  { name:'Cardano',  symbol:'ADA',  price:0.612,   change:0.8,  up:true  },
]

// ══ وسائل الإرسال — صور من public/images/ ══
export const SEND_METHODS = [
  { id:'vodafone',    name:'فودافون كاش',       nameEn:'Vodafone Cash',        symbol:'V', color:'#e40000', type:'egp',    flag:'🇪🇬',   img:'/images/vodafone.png'  },
  { id:'instapay',    name:'إنستا باي',          nameEn:'Instapay',             symbol:'I', color:'#1a56db', type:'egp',    flag:'🇪🇬',   img:'/images/instapay.png'  },
  { id:'etisalat',    name:'اتصالات كاش',        nameEn:'Etisalat Cash',        symbol:'E', color:'#009a44', type:'egp',    flag:'🇪🇬',   img:'/images/etisalat.png'  },
  { id:'usdt-trc',    name:'USDT',               nameEn:'USDT',                 symbol:'₮', color:'#26a17b', type:'crypto', flag:'USDT',  img:'/images/usdt.png'      },
  { id:'mgo-send',    name:'MoneyGo USD',        nameEn:'MoneyGo USD',          symbol:'M', color:'#e91e63', type:'crypto', flag:'MGO',   img:'/images/moneygo.png'   },
  { id:'wallet-usdt', name:'حساب داخلي USDT',   nameEn:'Internal USDT Wallet', symbol:'₮', color:'#0a7c5e', type:'wallet', flag:'N1',    img:'/images/usdt.png', walletOnly:true },
]

// ══ وسائل الاستلام — صور من public/images/ ══
export const RECEIVE_METHODS = [
  { id:'mgo-recv',   name:'MoneyGo USD',        nameEn:'MoneyGo USD',          symbol:'M', color:'#e91e63', type:'crypto', img:'/images/moneygo.png'  },
  { id:'usdt-recv',  name:'USDT TRC20',          nameEn:'USDT TRC20',           symbol:'₮', color:'#26a17b', type:'crypto', img:'/images/usdt.png'     },
  { id:'wallet-recv', name:'حساب داخلي USDT',   nameEn:'Internal USDT Wallet', symbol:'₮', color:'#0a7c5e', type:'wallet', img:'/images/usdt.png', walletOnly:true },
]

export const TRANSFER_INFO = {
  vodafone:   { labelAr:'رقم فودافون كاش',        labelEn:'Vodafone Cash Number',      value:'01012345678',                          noteAr:'حوّل باسم: NUMBER 1 EXCHANGE', noteEn:'Transfer to: NUMBER 1 EXCHANGE' },
  instapay:   { labelAr:'رقم إنستا باي',           labelEn:'Instapay Number',           value:'01098765432',                          noteAr:'من تطبيق البنك — إنستا باي',   noteEn:'Via banking app — Instapay' },
  etisalat:   { labelAr:'رقم اتصالات كاش',         labelEn:'Etisalat Cash Number',      value:'01112345678',                          noteAr:'حوّل باسم: NUMBER 1 EXCHANGE', noteEn:'Transfer to: NUMBER 1 EXCHANGE' },
  'usdt-trc': { labelAr:'عنوان محفظة USDT TRC20',  labelEn:'USDT TRC20 Wallet Address', value:'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', noteAr:'تأكد من شبكة TRC20 فقط',      noteEn:'TRC20 network only' },
  'mgo-send': { labelAr:'معرف محفظة MoneyGo',      labelEn:'MoneyGo Wallet ID',         value:'MGO-N1-EXCHANGE-2024',                 noteAr:'أرسل على هذا المعرف بالضبط',  noteEn:'Send to this exact ID' },
}

export const EXCHANGE_RATES = {
  'vodafone_mgo-recv':      0.0265,
  'vodafone_usdt-recv':     0.0265,
  'instapay_mgo-recv':      0.0265,
  'instapay_usdt-recv':     0.0265,
  'etisalat_mgo-recv':      0.0263,
  'etisalat_usdt-recv':     0.0263,
  'usdt-trc_mgo-recv':      1.00598,
  'usdt-trc_usdt-recv':     1.0,
  'mgo-send_usdt-recv':     0.9945,
  'mgo-send_mgo-recv':      1.0,
  // ── حساب داخلي ──
  'usdt-trc_wallet-recv':   1.0,   // إيداع USDT → محفظة داخلية
  'wallet-usdt_mgo-recv':   1.0,   // تحويل محفظة داخلية → MoneyGo
}

