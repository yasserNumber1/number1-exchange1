import useLang from '../../context/useLang'
import LegalLayout from './LegalLayout'

function Terms() {
  const { lang } = useLang()

  return (
    <LegalLayout title={lang === 'ar' ? 'الشروط والسياسات' : 'Terms & Policies'}>

      {/* AML / KYC */}
      <h2>{lang === 'ar' ? 'سياسة مكافحة غسيل الأموال (AML/KYC)' : 'AML / KYC Policy'}</h2>
      <p>
        {lang === 'ar'
          ? 'تلتزم المنصة بمنع غسيل الأموال وتمويل الإرهاب.'
          : 'The platform is committed to preventing money laundering and terrorism financing.'}
      </p>
      <ul>
        <li>{lang === 'ar' ? 'طلب توثيق الهوية' : 'Identity verification required'}</li>
        <li>{lang === 'ar' ? 'طلب مصدر الأموال' : 'Proof of funds required'}</li>
        <li>{lang === 'ar' ? 'تجميد الحسابات المشبوهة' : 'Suspicious accounts may be frozen'}</li>
      </ul>
      <p>
        {lang === 'ar' ? 'مدة التحقق من 1 إلى 10 أيام عمل.' : 'Verification takes 1–10 business days.'}
      </p>

      {/* Privacy Policy */}
      <h2 style={{ marginTop: 30 }}>{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</h2>
      <p>
        {lang === 'ar'
          ? 'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.'
          : 'We respect your privacy and are committed to protecting your personal data.'}
      </p>

      <h3>{lang === 'ar' ? 'جمع البيانات' : 'Data Collection'}</h3>
      <p>
        {lang === 'ar'
          ? 'قد نقوم بجمع معلومات مثل الاسم والبريد الإلكتروني.'
          : 'We may collect information such as name and email address.'}
      </p>

      <h3>{lang === 'ar' ? 'استخدام البيانات' : 'Use of Data'}</h3>
      <p>
        {lang === 'ar'
          ? 'نستخدم البيانات لتحسين الخدمة وتوفير تجربة أفضل.'
          : 'We use data to improve services and user experience.'}
      </p>

      <h3>{lang === 'ar' ? 'حماية البيانات' : 'Data Protection'}</h3>
      <p>
        {lang === 'ar'
          ? 'نطبق إجراءات أمنية لحماية بيانات المستخدمين.'
          : 'We apply security measures to protect user data.'}
      </p>

      <p style={{ marginTop: 30, fontSize: 13 }}>
        {lang === 'ar' ? 'آخر تحديث: 2025' : 'Last updated: 2025'}
      </p>

    </LegalLayout>
  )
}

export default Terms