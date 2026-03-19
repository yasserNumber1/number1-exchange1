// src/data/currencies.js
// ═══════════════════════════════════════
// هذا الملف يحتوي على كل البيانات الثابتة:
// - قائمة العملات
// - أزواج التبادل
// - أخبار
// - أسئلة شائعة
// ═══════════════════════════════════════

// ── قائمة العملات المدعومة ──
export const CURRENCIES = [
  { id: 'usdt-trc', name: 'USDT',     network: 'TRC20', symbol: '₮', color: '#26a17b' },
  { id: 'usdt-bep', name: 'USDT',     network: 'BEP20', symbol: '₮', color: '#26a17b' },
  { id: 'mgo',      name: 'MoneyGo',  network: 'MGO',   symbol: 'M', color: '#e91e63' },
  { id: 'btc',      name: 'Bitcoin',  network: 'BTC',   symbol: '₿', color: '#f7931a' },
  { id: 'eth',      name: 'Ethereum', network: 'ETH',   symbol: 'Ξ', color: '#627eea' },
  { id: 'bnb',      name: 'BNB',      network: 'BEP20', symbol: 'B', color: '#f0b90b' },
  { id: 'ton',      name: 'Toncoin',  network: 'TON',   symbol: 'T', color: '#0098ea' },
  { id: 'sol',      name: 'Solana',   network: 'SOL',   symbol: 'S', color: '#9945ff' },
  { id: 'ltc',      name: 'Litecoin', network: 'LTC',   symbol: 'Ł', color: '#bfbbbb' },
  { id: 'xrp',      name: 'XRP',      network: 'XRP',   symbol: 'X', color: '#00aae4' },
  { id: 'usdc',     name: 'USDC',     network: 'ERC20', symbol: '$', color: '#2775ca' },
  { id: 'doge',     name: 'Dogecoin', network: 'DOGE',  symbol: 'Ð', color: '#c2a633' },
]

// ── أزواج التبادل المعروضة في الصفحة الرئيسية ──
export const PAIRS = [
  { from: 'USDT',     fromNet: 'TRC20', to: 'MoneyGo', toNet: 'MGO',   fromColor: '#26a17b', toColor: '#e91e63', fromSym: '₮', toSym: 'M' },
  { from: 'Bitcoin',  fromNet: 'BTC',   to: 'MoneyGo', toNet: 'MGO',   fromColor: '#f7931a', toColor: '#e91e63', fromSym: '₿', toSym: 'M' },
  { from: 'Ethereum', fromNet: 'ETH',   to: 'MoneyGo', toNet: 'MGO',   fromColor: '#627eea', toColor: '#e91e63', fromSym: 'Ξ', toSym: 'M' },
  { from: 'BNB',      fromNet: 'BEP20', to: 'USDT',    toNet: 'TRC20', fromColor: '#f0b90b', toColor: '#26a17b', fromSym: 'B', toSym: '₮' },
  { from: 'Toncoin',  fromNet: 'TON',   to: 'USDT',    toNet: 'TRC20', fromColor: '#0098ea', toColor: '#26a17b', fromSym: 'T', toSym: '₮' },
  { from: 'Solana',   fromNet: 'SOL',   to: 'USDT',    toNet: 'TRC20', fromColor: '#9945ff', toColor: '#26a17b', fromSym: 'S', toSym: '₮' },
]

// ── بيانات شريط الأسعار المتحرك ──
export const TICKER_DATA = [
  { symbol: 'BTC/USD',  price: '67,420', change: '+2.4%', up: true  },
  { symbol: 'ETH/USD',  price: '3,840',  change: '-0.8%', up: false },
  { symbol: 'USDT/MGO', price: '1.00598',change: '+0.1%', up: true  },
  { symbol: 'BNB/USD',  price: '580',    change: '+1.2%', up: true  },
  { symbol: 'TON/USD',  price: '6.84',   change: '+3.5%', up: true  },
  { symbol: 'LTC/USD',  price: '84.20',  change: '-1.1%', up: false },
  { symbol: 'XRP/USD',  price: '0.584',  change: '+4.2%', up: true  },
  { symbol: 'SOL/USD',  price: '186',    change: '+2.1%', up: true  },
]

// ── جدول الأسعار ──
export const RATES_DATA = [
  { name: 'Bitcoin',  symbol: 'BTC',  price: 67420.5, change: 2.4,  up: true  },
  { name: 'Ethereum', symbol: 'ETH',  price: 3840.2,  change: 0.8,  up: false },
  { name: 'USDT',     symbol: 'USDT', price: 1.0,     change: 0.01, up: true  },
  { name: 'MoneyGo',  symbol: 'MGO',  price: 0.994,   change: 0.1,  up: true  },
  { name: 'BNB',      symbol: 'BNB',  price: 580.4,   change: 1.2,  up: true  },
  { name: 'Toncoin',  symbol: 'TON',  price: 6.84,    change: 3.5,  up: true  },
  { name: 'Litecoin', symbol: 'LTC',  price: 84.2,    change: 1.1,  up: false },
  { name: 'XRP',      symbol: 'XRP',  price: 0.584,   change: 4.2,  up: true  },
  { name: 'Solana',   symbol: 'SOL',  price: 186.4,   change: 2.1,  up: true  },
  { name: 'Cardano',  symbol: 'ADA',  price: 0.612,   change: 0.8,  up: true  },
]

// ── الأسئلة الشائعة ──
export const FAQS = [
  {
    q: 'كيف أبدأ عملية التبادل؟',
    a: 'اختر العملة من القائمة المنسدلة، أدخل المبلغ المراد تبادله، ثم أدخل بيانات المحفظة والبريد الإلكتروني، وافق على الشروط ثم اضغط إرسال.'
  },
  {
    q: 'ما هو الحد الأدنى للتبادل؟',
    a: 'الحد الأدنى هو 10 وحدة من العملة المرسلة لمعظم الأزواج.'
  },
  {
    q: 'كم يستغرق التحويل؟',
    a: 'معظم العمليات تتم خلال 1-5 دقائق. في أوقات ازدحام الشبكة قد تصل إلى 15 دقيقة.'
  },
  {
    q: 'هل بياناتي وأموالي آمنة؟',
    a: 'نعم! نستخدم تشفير AES-256 وحماية متعددة الطبقات مع شهادة ISO 27001.'
  },
  {
    q: 'ما هي الرسوم على كل عملية؟',
    a: 'رسومنا تبدأ من 0.1% فقط على كل عملية تبادل، وهي من أقل الرسوم في السوق.'
  },
  {
    q: 'كيف أتواصل مع فريق الدعم؟',
    a: 'يمكنك التواصل معنا عبر المساعد الذكي أو تيليجرام @Number1Exchange أو واتساب. الدعم متاح 24/7.'
  },
]

// ── الأخبار ──
export const NEWS = [
  {
    icon: '📈',
    tag: 'MARKET',
    title: 'Bitcoin يتجاوز 67,000 دولار مع تزايد الطلب المؤسسي',
    date: '18 مارس 2026',
    body: 'شهدت أسواق العملات الرقمية ارتفاعاً ملحوظاً في طلبات المستثمرين المؤسسيين على Bitcoin، مما دفع سعره إلى تجاوز حاجز 67,000 دولار للمرة الأولى منذ أشهر.'
  },
  {
    icon: '🔐',
    tag: 'SECURITY',
    title: 'Number 1 تحصل على شهادة أمان ISO 27001 الدولية',
    date: '16 مارس 2026',
    body: 'حصلت منصة Number 1 على شهادة أمان ISO 27001 الدولية المعترف بها عالمياً في مجال أمن المعلومات.'
  },
  {
    icon: '🚀',
    tag: 'UPDATE',
    title: 'إطلاق نسخة جديدة من المنصة مع واجهة محسّنة',
    date: '14 مارس 2026',
    body: 'أطلقت Number 1 نسختها الجديدة من المنصة التي تتضمن واجهة مستخدم محسّنة تماماً، وأداءً أسرع بنسبة 40%.'
  },
  {
    icon: '💱',
    tag: 'EXCHANGE',
    title: 'إضافة 5 أزواج تبادل جديدة تشمل Solana و Polygon',
    date: '12 مارس 2026',
    body: 'أعلنت المنصة عن إضافة 5 أزواج تبادل جديدة تشمل Solana وPolygon وAvalanche.'
  },
  {
    icon: '🌍',
    tag: 'EXPANSION',
    title: 'توسع خدمات Number 1 لتشمل دول الخليج العربي',
    date: '10 مارس 2026',
    body: 'وسّعت Number 1 نطاق خدماتها الجغرافي ليشمل دول الخليج العربي بشكل رسمي.'
  },
  {
    icon: '📊',
    tag: 'REPORT',
    title: 'تقرير: حجم معاملات المنصة يتجاوز 50 مليون دولار',
    date: '8 مارس 2026',
    body: 'كشف التقرير الربعي لمنصة Number 1 أن حجم معاملاتها تجاوز 50 مليون دولار خلال الربع الأول من 2026.'
  },
]