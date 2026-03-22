// src/context/LanguageContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react'

const LanguageContext = createContext()

const translations = {
  ar: {
    nav_home:'الرئيسية', nav_rates:'الأسعار', nav_news:'الأخبار', nav_support:'الدعم', nav_about:'من نحن', nav_login:'تسجيل الدخول', nav_register:'إنشاء حساب',
    hero_badge:'LIVE · منصة موثوقة ومرخصة', hero_title:'تبادل العملات الرقمية', hero_desc:'منصة Number 1 تقدم أفضل أسعار الصرف وأسرع معالجة للمعاملات مع حماية متكاملة لأموالك.', hero_btn:'تعرف علينا', hero_users:'مستخدم نشط', hero_tx:'معاملة ناجحة', hero_pairs:'زوج تبادل',
    promo_title:'عرض ترحيبي حصري للمستخدمين الجدد!', promo_desc:'رسوم مخفضة على أول 5 عمليات تبادل وكوبون خصم 20% على الرسوم الشهرية.',
    ex_title:'تبادل العملات', ex_send:'أنت ترسل · SEND', ex_recv:'أنت تستلم · RECEIVE', ex_rate:'EXCHANGE RATE', ex_details:'RECIPIENT · بيانات الطلب', ex_email:'EMAIL · البريد الإلكتروني', ex_email_ph:'example@email.com', ex_phone_lbl:'رقم هاتفك الذي ستحول منه', ex_phone_ph:'01XXXXXXXXX', ex_phone_hint:'هذا الرقم للتحقق من هويتك فقط', ex_recv_mgo:'معرف محفظة MoneyGo للاستلام', ex_recv_usdt:'عنوان محفظة USDT TRC20 للاستلام', ex_submit:'إرسال طلب التبادل ←', ex_aml:'أقر بأن الأموال مشروعة وأوافق على سياسة AML', ex_tos:'أوافق على شروط الخدمة وسياسة الخصوصية', ex_note_usdt:'ستظهر لك عنوان محفظتنا لإرسال USDT بعد الضغط على إرسال الطلب', ex_note_mgo:'ستظهر لك معرف حساب MoneyGo الخاص بنا بعد الضغط على إرسال الطلب',
    confirm_title:'تأكيد الطلب', confirm_summary:'ملخص الطلب', confirm_send:'ترسل', confirm_recv:'تستلم', confirm_step1_num:'أرسل المبلغ على هذا الرقم', confirm_step1_addr:'أرسل المبلغ على هذا العنوان', confirm_timer:'لديك 30 دقيقة لإتمام التحويل ورفع الإيصال', confirm_step2:'ارفع صورة الإيصال', confirm_upload:'اضغط لرفع صورة الإيصال', confirm_upload_hint:'JPG, PNG, PDF — حتى 5MB', confirm_copy:'نسخ', confirm_copied:'✓ تم', confirm_submit:'إرسال الطلب نهائياً ✓', confirm_loading:'جاري الإرسال...', confirm_no_receipt:'↑ ارفع الإيصال أولاً', confirm_success_title:'تم إرسال الطلب!', confirm_success_desc:'سيقوم فريقنا بمراجعة الإيصال وتحويل المبلغ خلال 15-30 دقيقة', confirm_success_btn:'حسناً ✓',
    reviews_title:'تقييمات العملاء', reviews_more:'عرض الكل — 1,240+ تقييم',
    pairs_title:'أزواج التبادل',
    features_badge:'لماذا نحن؟', features_title:'لماذا نحن الأفضل؟',
    rates_badge:'LIVE RATES', rates_title:'أسعار الصرف المباشرة', rates_desc:'تتحدث الأسعار تلقائياً كل بضع ثوانٍ', rates_table:'جدول الأسعار', rates_col1:'العملة', rates_col2:'السعر (USD)', rates_col3:'التغيير 24h', rates_col4:'الحالة',
    news_badge:'أخبار', news_title:'آخر أخبار العملات الرقمية',
    support_badge:'دعم', support_title:'مركز الدعم والمساعدة', support_bot:'دردشة مع البوت', support_bot_desc:'ردود فورية على مدار الساعة', support_tg:'تيليجرام', support_tg_desc:'@Number1Exchange — دعم فوري', support_wa:'واتساب', support_wa_desc:'دعم مباشر 24/7', faq_title:'الأسئلة الشائعة',
    about_badge:'عن المنصة', about_title:'من نحن؟', about_vision:'رؤيتنا', about_h:'المنصة الأولى للتبادل الآمن في المنطقة العربية', about_p1:'تأسست Number 1 عام 2021 بهدف توفير منصة تبادل عملات رقمية موثوقة وسريعة وآمنة لمستخدمي المنطقة العربية.', about_p2:'يضم فريقنا أكثر من 50 خبيراً في مجالات التقنية المالية والأمن السيبراني وتجربة المستخدم.', about_btn:'ابدأ التبادل الآن →', about_team:'فريق العمل',
    footer_desc:'منصة Number 1 للتبادل — الأكثر موثوقية وسرعة في المنطقة العربية.', footer_links:'روابط', footer_legal:'قانوني', footer_contact:'تواصل', footer_terms:'شروط الخدمة', footer_privacy:'سياسة الخصوصية', footer_aml:'AML Policy', footer_cookies:'سياسة الكوكيز', footer_chat:'دردشة مباشرة', footer_tg:'تيليجرام', footer_support:'مركز المساعدة', footer_copy:'© 2026 NUMBER 1 EXCHANGE',
    curr_egp:'جنيه مصري', curr_crypto:'رقمي',
    auth_login:'تسجيل الدخول', auth_register:'إنشاء حساب', auth_email:'البريد الإلكتروني', auth_password:'كلمة المرور', auth_confirm_pw:'تأكيد كلمة المرور', auth_username:'اسم المستخدم', auth_phone:'رقم الهاتف', auth_login_btn:'دخول →', auth_register_btn:'التالي →', auth_or:'أو', auth_google:'المتابعة بـ Google', auth_forgot:'نسيت كلمة المرور؟', auth_otp_title:'تم إرسال رمز التحقق', auth_otp_resend:'أعد الإرسال', auth_success_login:'تم الدخول بنجاح!', auth_success_register:'تم إنشاء الحساب!', auth_welcome:'مرحباً بك في Number 1 Exchange', auth_continue:'المتابعة →', auth_start:'ابدأ التبادل الآن →', auth_captcha_wrong:'رمز التحقق خاطئ', auth_fill_all:'يرجى ملء جميع الحقول', auth_pw_mismatch:'كلمتا المرور غير متطابقتين', auth_pw_weak:'اختر رمزاً أقوى', auth_pw_strength_1:'ضعيف', auth_pw_strength_2:'مقبول', auth_pw_strength_3:'جيد', auth_pw_strength_4:'قوي جداً', auth_rule_len:'8 أحرف على الأقل', auth_rule_up:'حرف كبير واحد على الأقل', auth_rule_num:'رقم واحد على الأقل', auth_rule_sym:'رمز خاص مثل !@#$',
  },
  en: {
    nav_home:'Home', nav_rates:'Rates', nav_news:'News', nav_support:'Support', nav_about:'About', nav_login:'Login', nav_register:'Sign Up',
    hero_badge:'LIVE · Trusted & Licensed Platform', hero_title:'Digital Currency Exchange', hero_desc:'Number 1 offers the best exchange rates and fastest transaction processing with full protection for your funds.', hero_btn:'Learn About Us', hero_users:'Active Users', hero_tx:'Successful Transactions', hero_pairs:'Trading Pairs',
    promo_title:'Exclusive Welcome Offer for New Users!', promo_desc:'Reduced fees on your first 5 exchange operations and a 20% discount coupon on monthly fees.',
    ex_title:'Currency Exchange', ex_send:'You Send · أنت ترسل', ex_recv:'You Receive · أنت تستلم', ex_rate:'EXCHANGE RATE', ex_details:'RECIPIENT · Order Details', ex_email:'EMAIL · Email Address', ex_email_ph:'example@email.com', ex_phone_lbl:'Your phone number to transfer from', ex_phone_ph:'01XXXXXXXXX', ex_phone_hint:'This number is for identity verification only', ex_recv_mgo:'MoneyGo Wallet ID for Receiving', ex_recv_usdt:'USDT TRC20 Wallet Address for Receiving', ex_submit:'Submit Exchange Request →', ex_aml:'I confirm funds are legitimate and agree to AML Policy', ex_tos:'I agree to Terms of Service and Privacy Policy', ex_note_usdt:'Our USDT wallet address will appear after you click Submit', ex_note_mgo:'Our MoneyGo account ID will appear after you click Submit',
    confirm_title:'Order Confirmation', confirm_summary:'Order Summary', confirm_send:'You Send', confirm_recv:'You Receive', confirm_step1_num:'Send the amount to this number', confirm_step1_addr:'Send the amount to this address', confirm_timer:'You have 30 minutes to complete the transfer and upload the receipt', confirm_step2:'Upload Receipt Photo', confirm_upload:'Click to upload receipt photo', confirm_upload_hint:'JPG, PNG, PDF — up to 5MB', confirm_copy:'Copy', confirm_copied:'✓ Copied', confirm_submit:'Submit Order ✓', confirm_loading:'Submitting...', confirm_no_receipt:'↑ Upload Receipt First', confirm_success_title:'Order Submitted!', confirm_success_desc:'Our team will review the receipt and transfer within 15-30 minutes', confirm_success_btn:'OK ✓',
    reviews_title:'Customer Reviews', reviews_more:'View All — 1,240+ Reviews',
    pairs_title:'Trading Pairs',
    features_badge:'WHY US?', features_title:'Why Are We The Best?',
    rates_badge:'LIVE RATES', rates_title:'Live Exchange Rates', rates_desc:'Prices update automatically every few seconds', rates_table:'Rates Table', rates_col1:'Currency', rates_col2:'Price (USD)', rates_col3:'24h Change', rates_col4:'Status',
    news_badge:'NEWS', news_title:'Latest Crypto News',
    support_badge:'SUPPORT', support_title:'Support Center', support_bot:'Chat with Bot', support_bot_desc:'Instant replies around the clock', support_tg:'Telegram', support_tg_desc:'@Number1Exchange — instant support', support_wa:'WhatsApp', support_wa_desc:'Direct support 24/7', faq_title:'Frequently Asked Questions',
    about_badge:'ABOUT', about_title:'Who Are We?', about_vision:'Our Vision', about_h:'The #1 Secure Exchange Platform in the Arab Region', about_p1:'Number 1 was founded in 2021 to provide a trusted, fast and secure digital currency exchange platform for Arab region users.', about_p2:'Our team includes more than 50 experts in financial technology, cybersecurity and user experience.', about_btn:'Start Exchanging Now →', about_team:'Our Team',
    footer_desc:'Number 1 Exchange Platform — The most trusted and fastest in the Arab region.', footer_links:'Links', footer_legal:'Legal', footer_contact:'Contact', footer_terms:'Terms of Service', footer_privacy:'Privacy Policy', footer_aml:'AML Policy', footer_cookies:'Cookie Policy', footer_chat:'Live Chat', footer_tg:'Telegram', footer_support:'Help Center', footer_copy:'© 2026 NUMBER 1 EXCHANGE',
    curr_egp:'Egyptian Pound', curr_crypto:'Crypto',
    auth_login:'Login', auth_register:'Sign Up', auth_email:'Email Address', auth_password:'Password', auth_confirm_pw:'Confirm Password', auth_username:'Username', auth_phone:'Phone Number', auth_login_btn:'Login →', auth_register_btn:'Next →', auth_or:'or', auth_google:'Continue with Google', auth_forgot:'Forgot password?', auth_otp_title:'Verification code sent', auth_otp_resend:'Resend', auth_success_login:'Logged in successfully!', auth_success_register:'Account created!', auth_welcome:'Welcome to Number 1 Exchange', auth_continue:'Continue →', auth_start:'Start Exchanging Now →', auth_captcha_wrong:'Wrong captcha code', auth_fill_all:'Please fill all fields', auth_pw_mismatch:'Passwords do not match', auth_pw_weak:'Choose a stronger password', auth_pw_strength_1:'Weak', auth_pw_strength_2:'Fair', auth_pw_strength_3:'Good', auth_pw_strength_4:'Strong', auth_rule_len:'At least 8 characters', auth_rule_up:'At least one uppercase letter', auth_rule_num:'At least one number', auth_rule_sym:'Special character like !@#$',
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar')
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir  = dir
    localStorage.setItem('lang', lang)
  }, [lang, dir])

  const t = useCallback((key) => translations[lang][key] || key, [lang])
  const toggleLang = () => setLang(p => p === 'ar' ? 'en' : 'ar')

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export { LanguageContext }
