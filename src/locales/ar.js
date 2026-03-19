// src/locales/ar.js
// ═══════════════════════════════════════
// كل النصوص العربية في مكان واحد
// لإضافة نص جديد: أضفه هنا وفي en.js
// ═══════════════════════════════════════

const ar = {
  // ── الـ Navbar ──
  nav_home:     'الرئيسية',
  nav_rates:    'الأسعار',
  nav_news:     'الأخبار',
  nav_support:  'الدعم',
  nav_about:    'من نحن',
  nav_login:    'تسجيل الدخول',
  nav_register: 'إنشاء حساب',

  // ── Hero Section ──
  hero_badge:       'LIVE · منصة موثوقة ومرخصة',
  hero_title:       'تبادل العملات الرقمية',
  hero_desc:        'منصة Number 1 تقدم أفضل أسعار الصرف وأسرع معالجة للمعاملات مع حماية متكاملة لأموالك.',
  hero_btn:         'تعرف علينا',
  hero_users:       'مستخدم نشط',
  hero_tx:          'معاملة ناجحة',
  hero_pairs:       'زوج تبادل',

  // ── Promo Banner ──
  promo_title: 'عرض ترحيبي حصري للمستخدمين الجدد!',
  promo_desc:  'رسوم مخفضة على أول 5 عمليات تبادل وكوبون خصم 20% على الرسوم الشهرية.',

  // ── Exchange Form ──
  exchange_title:      'تبادل العملات',
  exchange_send:       'أنت ترسل · SEND',
  exchange_receive:    'أنت تستلم · RECEIVE',
  exchange_min:        'الحد الأدنى: 10',
  exchange_rate:       'سعر الصرف',
  exchange_recipient:  'RECIPIENT · بيانات الطلب',
  exchange_email:      'EMAIL · البريد الإلكتروني',
  exchange_email_ph:   'example@email.com',
  exchange_phone_lbl:  'رقم هاتفك الذي ستحول منه',
  exchange_phone_ph:   '01XXXXXXXXX',
  exchange_phone_hint: 'ℹ️ هذا الرقم للتحقق من هويتك فقط',
  exchange_recv_mgo:   'معرف محفظة MoneyGo للاستلام',
  exchange_recv_usdt:  'عنوان محفظة USDT TRC20 للاستلام',
  exchange_recv_mgo_ph:'MGO-XXXXXXXXX',
  exchange_recv_usdt_ph:'T... — عنوان TRC20',
  exchange_info_usdt:  'ستظهر لك عنوان محفظتنا لإرسال USDT بعد الضغط على إرسال الطلب',
  exchange_info_mgo:   'ستظهر لك معرف حساب MoneyGo الخاص بنا بعد الضغط على إرسال الطلب',
  exchange_aml:        'أقر بأن الأموال مشروعة وأوافق على',
  exchange_aml_link:   'سياسة AML',
  exchange_tos:        'أوافق على',
  exchange_tos_link:   'شروط الخدمة',
  exchange_tos_and:    'و',
  exchange_tos_link2:  'سياسة الخصوصية',
  exchange_submit:     'إرسال طلب التبادل ←',
  exchange_usdt_note:  'USDT TRC20 · معلومة',
  exchange_mgo_note:   'MoneyGo USD · معلومة',

  // ── Confirm Modal ──
  confirm_title:        'تأكيد الطلب',
  confirm_subtitle:     'ORDER CONFIRMATION',
  confirm_summary:      'ORDER SUMMARY',
  confirm_send:         'ترسل',
  confirm_receive:      'تستلم',
  confirm_step1:        'أرسل المبلغ على هذا',
  confirm_step1_num:    'الرقم',
  confirm_step1_addr:   'العنوان',
  confirm_timer:        'لديك',
  confirm_timer2:       'دقيقة لإتمام التحويل ورفع الإيصال',
  confirm_step2:        'ارفع صورة الإيصال',
  confirm_upload:       'اضغط لرفع صورة الإيصال',
  confirm_upload_hint:  'JPG, PNG, PDF — حتى 5MB',
  confirm_btn_disabled: '↑ ارفع الإيصال أولاً',
  confirm_btn_ready:    'إرسال الطلب نهائياً ✓',
  confirm_btn_loading:  '⏳ جاري الإرسال...',
  confirm_success_title:'تم إرسال الطلب!',
  confirm_success_desc: 'سيقوم فريقنا بمراجعة الإيصال وتحويل المبلغ خلال 15-30 دقيقة',
  confirm_success_btn:  'حسناً ✓',
  confirm_copy:         '📋 نسخ',
  confirm_copied:       '✓ تم',
  confirm_warn:         'تنبيه',

  // ── Reviews Sidebar ──
  reviews_title: 'تقييمات العملاء',
  reviews_more:  'عرض الكل — 1,240+ تقييم',

  // ── Pairs Sidebar ──
  pairs_title: 'أزواج التبادل',

  // ── Features Section ──
  features_badge:    'WHY NUMBER 1',
  features_title:    'لماذا نحن الأفضل؟',
  feature_1_title:   'معاملات فورية',
  feature_1_desc:    'تتم عمليات التبادل خلال ثوانٍ مع تأكيد فوري وإشعارات لحظية',
  feature_2_title:   'أمان عالي المستوى',
  feature_2_desc:    'تشفير AES-256 وحماية متعددة الطبقات لضمان سلامة أموالك وبياناتك',
  feature_3_title:   'دعم 24 / 7',
  feature_3_desc:    'فريق متخصص متاح على مدار الساعة عبر الدردشة والبريد والتيليجرام',
  feature_4_title:   'أفضل الأسعار',
  feature_4_desc:    'رسوم تنافسية تبدأ من 0.1% فقط مع أفضل أسعار الصرف في السوق',
  feature_5_title:   'تغطية عالمية',
  feature_5_desc:    'خدماتنا متاحة في أكثر من 50 دولة مع دعم كامل للعملات الرقمية',
  feature_6_title:   'أزواج متنوعة',
  feature_6_desc:    'أكثر من 50 زوج تبادل متاح بين العملات الرقمية والمحافظ الإلكترونية',

  // ── Footer ──
  footer_desc:    'منصة Number 1 للتبادل — الأكثر موثوقية وسرعة في المنطقة العربية.',
  footer_links:   'روابط',
  footer_legal:   'قانوني',
  footer_contact: 'تواصل',
  footer_terms:   'شروط الخدمة',
  footer_privacy: 'سياسة الخصوصية',
  footer_aml:     'AML Policy',
  footer_cookies: 'سياسة الكوكيز',
  footer_chat:    'دردشة مباشرة',
  footer_tg:      'تيليجرام',
  footer_support: 'مركز المساعدة',
  footer_copy:    '© 2026 NUMBER 1 EXCHANGE — ALL RIGHTS RESERVED',

  // ── Ticker ──
  ticker_live: 'مباشر',

  // ── Currency Names ──
  curr_egp:    'جنيه مصري',
  curr_crypto: 'رقمي',
}

export default ar