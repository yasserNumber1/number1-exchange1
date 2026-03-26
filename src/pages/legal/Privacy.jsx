import useLang from '../../context/useLang'
import LegalLayout from './LegalLayout'

function Privacy() {
  const { lang } = useLang()

  return (
    <LegalLayout title={lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}>

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

export default Privacy