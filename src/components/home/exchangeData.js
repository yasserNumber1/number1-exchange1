// src/components/home/exchangeData.js
// ═══════════════════════════════════════
// كل البيانات المتعلقة بالتبادل في مكان واحد
// إذا أردت إضافة عملة جديدة — عدّل هذا الملف فقط
// ═══════════════════════════════════════

// العملات التي يمكن الإرسال منها
export const SEND_METHODS = [
  { id: 'vodafone',  name: 'فودافون كاش',  symbol: 'V', color: '#e40000', type: 'egp',    flag: '🇪🇬' },
  { id: 'instapay',  name: 'إنستا باي',     symbol: 'I', color: '#1a56db', type: 'egp',    flag: '🇪🇬' },
  { id: 'etisalat',  name: 'اتصالات كاش',   symbol: 'E', color: '#009a44', type: 'egp',    flag: '🇪🇬' },
  { id: 'usdt-trc',  name: 'USDT',          symbol: '₮', color: '#26a17b', type: 'crypto', flag: '🔷' },
  { id: 'mgo-send',  name: 'MoneyGo USD',   symbol: 'M', color: '#e91e63', type: 'crypto', flag: '💳' },
]

// العملات التي يمكن الاستلام بها
export const RECEIVE_METHODS = [
  { id: 'mgo-recv',  name: 'MoneyGo USD',  symbol: 'M', color: '#e91e63', type: 'crypto' },
  { id: 'usdt-recv', name: 'USDT TRC20',   symbol: '₮', color: '#26a17b', type: 'crypto' },
]

// بيانات التحويل — رقم الهاتف أو عنوان المحفظة لكل وسيلة
export const TRANSFER_INFO = {
  vodafone:   { label: 'رقم فودافون كاش',       value: '01012345678',                           note: 'حوّل باسم: NUMBER 1 EXCHANGE' },
  instapay:   { label: 'رقم إنستا باي',          value: '01098765432',                           note: 'من تطبيق البنك — خدمة إنستا باي' },
  etisalat:   { label: 'رقم اتصالات كاش',        value: '01112345678',                           note: 'حوّل باسم: NUMBER 1 EXCHANGE' },
  'usdt-trc': { label: 'عنوان محفظة USDT TRC20', value: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',   note: 'تأكد من شبكة TRC20 فقط' },
  'mgo-send': { label: 'معرف محفظة MoneyGo',     value: 'MGO-N1-EXCHANGE-2024',                  note: 'أرسل على هذا المعرف بالضبط' },
}

// أسعار الصرف لكل زوج
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

// التقييمات
export const REVIEWS = [
  { name: 'زكريا عمر', color: 'linear-gradient(135deg,#00d2ff,#7c5cfc)', date: '03/14', text: 'أفضل خدمة تبادل! سريع وموثوق جداً' },
  { name: 'محتار عدن', color: 'linear-gradient(135deg,#c8a84b,#f59e0b)', date: '03/13', text: 'خدمة ممتازة وسريعة، أنصح بها' },
  { name: 'أحمد سالم', color: 'linear-gradient(135deg,#00e5a0,#00b3d9)', date: '03/12', text: 'تجربة رائعة أنصح بها بشدة' },
]

// مميزات المنصة
export const FEATURES = [
  { icon: '⚡', title: 'معاملات فورية',      desc: 'تتم عمليات التبادل خلال ثوانٍ مع تأكيد فوري وإشعارات لحظية' },
  { icon: '🔐', title: 'أمان عالي المستوى',  desc: 'تشفير AES-256 وحماية متعددة الطبقات لضمان سلامة أموالك وبياناتك' },
  { icon: '💬', title: 'دعم 24 / 7',          desc: 'فريق متخصص متاح على مدار الساعة عبر الدردشة والبريد والتيليجرام' },
  { icon: '💰', title: 'أفضل الأسعار',        desc: 'رسوم تنافسية تبدأ من 0.1% فقط مع أفضل أسعار الصرف في السوق' },
  { icon: '🌍', title: 'تغطية عالمية',        desc: 'خدماتنا متاحة في أكثر من 50 دولة مع دعم كامل للعملات الرقمية' },
  { icon: '📊', title: 'أزواج متنوعة',        desc: 'أكثر من 50 زوج تبادل متاح بين العملات الرقمية والمحافظ الإلكترونية' },
]