// src/data/currencies.js — كل بيانات المشروع

export const TICKER_DATA = [
  { symbol:'BTC/USD',  price:'67,420',  change:'+2.4%', up:true  },
  { symbol:'ETH/USD',  price:'3,840',   change:'-0.8%', up:false },
  { symbol:'USDT/MGO', price:'1.00598', change:'+0.1%', up:true  },
  { symbol:'BNB/USD',  price:'580',     change:'+1.2%', up:true  },
  { symbol:'TON/USD',  price:'6.84',    change:'+3.5%', up:true  },
  { symbol:'LTC/USD',  price:'84.20',   change:'-1.1%', up:false },
  { symbol:'XRP/USD',  price:'0.584',   change:'+4.2%', up:true  },
  { symbol:'SOL/USD',  price:'186',     change:'+2.1%', up:true  },
]

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
  { id:'vodafone',  name:'فودافون كاش',  nameEn:'Vodafone Cash',  symbol:'V', color:'#e40000', type:'egp',    flag:'🇪🇬', img:'/images/vodafone.png'  },
  { id:'instapay',  name:'إنستا باي',    nameEn:'Instapay',       symbol:'I', color:'#1a56db', type:'egp',    flag:'🇪🇬', img:'/images/instapay.png'  },
  { id:'etisalat',  name:'اتصالات كاش',  nameEn:'Etisalat Cash',  symbol:'E', color:'#009a44', type:'egp',    flag:'🇪🇬', img:'/images/etisalat.png'  },
  { id:'usdt-trc',  name:'USDT',         nameEn:'USDT',           symbol:'₮', color:'#26a17b', type:'crypto', flag:'🔷', img:'/images/usdt.png'      },
  { id:'mgo-send',  name:'MoneyGo USD',  nameEn:'MoneyGo USD',    symbol:'M', color:'#e91e63', type:'crypto', flag:'💳', img:'/images/moneygo.png'   },
]

// ══ وسائل الاستلام — صور من public/images/ ══
export const RECEIVE_METHODS = [
  { id:'mgo-recv',  name:'MoneyGo USD', nameEn:'MoneyGo USD', symbol:'M', color:'#e91e63', type:'crypto', img:'/images/moneygo.png'  },
  { id:'usdt-recv', name:'USDT TRC20',  nameEn:'USDT TRC20',  symbol:'₮', color:'#26a17b', type:'crypto', img:'/images/usdt.png'     },
]

export const TRANSFER_INFO = {
  vodafone:   { labelAr:'رقم فودافون كاش',        labelEn:'Vodafone Cash Number',      value:'01012345678',                          noteAr:'حوّل باسم: NUMBER 1 EXCHANGE', noteEn:'Transfer to: NUMBER 1 EXCHANGE' },
  instapay:   { labelAr:'رقم إنستا باي',           labelEn:'Instapay Number',           value:'01098765432',                          noteAr:'من تطبيق البنك — إنستا باي',   noteEn:'Via banking app — Instapay' },
  etisalat:   { labelAr:'رقم اتصالات كاش',         labelEn:'Etisalat Cash Number',      value:'01112345678',                          noteAr:'حوّل باسم: NUMBER 1 EXCHANGE', noteEn:'Transfer to: NUMBER 1 EXCHANGE' },
  'usdt-trc': { labelAr:'عنوان محفظة USDT TRC20',  labelEn:'USDT TRC20 Wallet Address', value:'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', noteAr:'تأكد من شبكة TRC20 فقط',      noteEn:'TRC20 network only' },
  'mgo-send': { labelAr:'معرف محفظة MoneyGo',      labelEn:'MoneyGo Wallet ID',         value:'MGO-N1-EXCHANGE-2024',                 noteAr:'أرسل على هذا المعرف بالضبط',  noteEn:'Send to this exact ID' },
}

export const EXCHANGE_RATES = {
  'vodafone_mgo-recv':   0.0265,
  'vodafone_usdt-recv':  0.0265,
  'instapay_mgo-recv':   0.0265,
  'instapay_usdt-recv':  0.0265,
  'etisalat_mgo-recv':   0.0263,
  'etisalat_usdt-recv':  0.0263,
  'usdt-trc_mgo-recv':   1.00598,
  'usdt-trc_usdt-recv':  1.0,
  'mgo-send_usdt-recv':  0.9945,
  'mgo-send_mgo-recv':   1.0,
}

export const REVIEWS = [
  { name:'زكريا عمر',  nameEn:'Zakaria Omar',  color:'linear-gradient(135deg,#00d2ff,#7c5cfc)', date:'03/14', textAr:'أفضل خدمة تبادل! سريع وموثوق جداً',   textEn:'Best exchange service! Very fast and reliable' },
  { name:'محتار عدن',  nameEn:'Mokhtar Aden',  color:'linear-gradient(135deg,#c8a84b,#f59e0b)', date:'03/13', textAr:'خدمة ممتازة وسريعة، أنصح بها',        textEn:'Excellent and fast service, highly recommended' },
  { name:'أحمد سالم',  nameEn:'Ahmed Salem',   color:'linear-gradient(135deg,#00e5a0,#00b3d9)', date:'03/12', textAr:'تجربة رائعة أنصح بها بشدة',           textEn:'Wonderful experience, strongly recommend it' },
]

export const FEATURES = [
  { icon:'zap', titleAr:'معاملات فورية',      titleEn:'Instant Transactions',  descAr:'تتم عمليات التبادل خلال ثوانٍ مع تأكيد فوري وإشعارات لحظية',               descEn:'Exchange operations complete in seconds with instant confirmation' },
  { icon:'lock', titleAr:'أمان عالي المستوى',  titleEn:'High-Level Security',   descAr:'تشفير AES-256 وحماية متعددة الطبقات لضمان سلامة أموالك وبياناتك',         descEn:'AES-256 encryption and multi-layer protection for your funds' },
  { icon:'chat', titleAr:'دعم 24/7',            titleEn:'24/7 Support',          descAr:'فريق متخصص متاح على مدار الساعة عبر الدردشة والبريد والتيليجرام',          descEn:'Specialized team available around the clock via chat and Telegram' },
  { icon:'dollar', titleAr:'أفضل الأسعار',        titleEn:'Best Rates',            descAr:'رسوم تنافسية تبدأ من 0.1% فقط مع أفضل أسعار الصرف في السوق',              descEn:'Competitive fees starting from just 0.1% with the best market rates' },
  { icon:'globe', titleAr:'تغطية عالمية',        titleEn:'Global Coverage',       descAr:'خدماتنا متاحة في أكثر من 50 دولة مع دعم كامل للعملات الرقمية',             descEn:'Our services available in 50+ countries with full crypto support' },
  { icon:'chart', titleAr:'أزواج متنوعة',        titleEn:'Diverse Pairs',         descAr:'أكثر من 50 زوج تبادل متاح بين العملات الرقمية والمحافظ الإلكترونية',       descEn:'50+ trading pairs available between digital currencies and e-wallets' },
]

export const NEWS = [
  { icon:'trend', tagAr:'السوق',  tagEn:'MARKET',    titleAr:'Bitcoin يتجاوز 67,000 دولار مع تزايد الطلب المؤسسي',  titleEn:'Bitcoin Surpasses $67,000 as Institutional Demand Rises',     date:'18 Mar 2026', bodyAr:'شهدت أسواق العملات الرقمية ارتفاعاً ملحوظاً في طلبات المستثمرين المؤسسيين على Bitcoin، مما دفع سعره إلى تجاوز حاجز 67,000 دولار.', bodyEn:'Digital currency markets saw a notable rise in institutional investor demand for Bitcoin, pushing its price above $67,000.' },
  { icon:'lock', tagAr:'الأمان', tagEn:'SECURITY',  titleAr:'Number 1 تحصل على شهادة أمان ISO 27001 الدولية',      titleEn:'Number 1 Obtains ISO 27001 International Security Certificate', date:'16 Mar 2026', bodyAr:'حصلت منصة Number 1 على شهادة أمان ISO 27001 الدولية المعترف بها عالمياً في مجال أمن المعلومات.', bodyEn:'Number 1 platform obtained the internationally recognized ISO 27001 security certificate.' },
  { icon:'rocket', tagAr:'تحديث',  tagEn:'UPDATE',    titleAr:'إطلاق نسخة جديدة من المنصة مع واجهة محسّنة',          titleEn:'New Platform Version Launched with Improved Interface',         date:'14 Mar 2026', bodyAr:'أطلقت Number 1 نسختها الجديدة من المنصة التي تتضمن واجهة مستخدم محسّنة تماماً وأداءً أسرع بنسبة 40%.', bodyEn:'Number 1 launched its new platform version with a completely improved user interface and 40% faster performance.' },
  { icon:'exchange', tagAr:'تبادل',  tagEn:'EXCHANGE',  titleAr:'إضافة 5 أزواج تبادل جديدة تشمل Solana و Polygon',     titleEn:'5 New Trading Pairs Added Including Solana and Polygon',        date:'12 Mar 2026', bodyAr:'أعلنت المنصة عن إضافة 5 أزواج تبادل جديدة تشمل Solana وPolygon وAvalanche.', bodyEn:'The platform announced 5 new trading pairs including Solana, Polygon and Avalanche.' },
  { icon:'globe', tagAr:'توسع',   tagEn:'EXPANSION', titleAr:'توسع خدمات Number 1 لتشمل دول الخليج العربي',         titleEn:'Number 1 Services Expand to Include Gulf Countries',           date:'10 Mar 2026', bodyAr:'وسّعت Number 1 نطاق خدماتها الجغرافي ليشمل دول الخليج العربي بشكل رسمي.', bodyEn:'Number 1 officially expanded its geographic reach to include Gulf countries.' },
  { icon:'chart', tagAr:'تقرير',  tagEn:'REPORT',    titleAr:'تقرير: حجم معاملات المنصة يتجاوز 50 مليون دولار',     titleEn:'Report: Platform Transaction Volume Exceeds $50 Million',      date:'8 Mar 2026',  bodyAr:'كشف التقرير الربعي لمنصة Number 1 أن حجم معاملاتها تجاوز 50 مليون دولار خلال الربع الأول من 2026.', bodyEn:"Number 1's quarterly report revealed transaction volume exceeded $50 million in Q1 2026." },
]

export const FAQS = [
  { qAr:'كيف أبدأ عملية التبادل؟',   qEn:'How do I start an exchange?',          aAr:'اختر العملة من القائمة المنسدلة، أدخل المبلغ، ثم أدخل بيانات المحفظة والبريد الإلكتروني، وافق على الشروط ثم اضغط إرسال.', aEn:'Choose the currency, enter the amount, then enter your wallet details and email, agree to terms and click Submit.' },
  { qAr:'ما هو الحد الأدنى للتبادل؟', qEn:'What is the minimum exchange amount?', aAr:'الحد الأدنى هو 10 وحدة من العملة المرسلة لمعظم الأزواج.', aEn:'The minimum is 10 units of the sending currency for most pairs.' },
  { qAr:'كم يستغرق التحويل؟',         qEn:'How long does the transfer take?',     aAr:'معظم العمليات تتم خلال 1-5 دقائق. في أوقات ازدحام الشبكة قد تصل إلى 15 دقيقة.', aEn:'Most operations complete within 1-5 minutes. During network congestion it may take up to 15 minutes.' },
  { qAr:'هل بياناتي وأموالي آمنة؟',   qEn:'Are my data and funds safe?',          aAr:'نعم! نستخدم تشفير AES-256 وحماية متعددة الطبقات مع شهادة ISO 27001.', aEn:'Yes! We use AES-256 encryption and multi-layer protection with ISO 27001 certification.' },
  { qAr:'ما هي الرسوم على كل عملية؟', qEn:'What are the fees per transaction?',   aAr:'رسومنا تبدأ من 0.1% فقط على كل عملية تبادل.', aEn:'Our fees start from just 0.1% per exchange operation.' },
  { qAr:'كيف أتواصل مع فريق الدعم؟', qEn:'How do I contact support?',            aAr:'عبر المساعد الذكي أو تيليجرام @Number1Exchange أو واتساب. الدعم متاح 24/7.', aEn:'Via AI assistant, Telegram @Number1Exchange, or WhatsApp. Support available 24/7.' },
]