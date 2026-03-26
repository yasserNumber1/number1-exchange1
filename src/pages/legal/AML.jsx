import useLang from '../../context/useLang'
import LegalLayout from './LegalLayout'

function AML() {
  const { lang } = useLang()

  return (
    <LegalLayout title={lang === 'ar'
      ? 'سياسة مكافحة غسيل الأموال (AML/KYC)'
      : 'AML / KYC Policy'}>

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
        {lang === 'ar'
          ? 'مدة التحقق من 1 إلى 10 أيام عمل.'
          : 'Verification takes 1–10 business days.'}
      </p>

      <p style={{ marginTop: 30, fontSize: 13 }}>
        {lang === 'ar' ? 'آخر تحديث: 2025' : 'Last updated: 2025'}
      </p>

    </LegalLayout>
  )
}

export default AML