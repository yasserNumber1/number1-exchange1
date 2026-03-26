import useLang from '../../context/useLang'
import LegalLayout from './LegalLayout'

function Cookies() {
  const { lang } = useLang()

  return (
    <LegalLayout title={lang === 'ar'
      ? 'سياسة الكوكيز'
      : 'Cookies Policy'}>

      <p>
        {lang === 'ar'
          ? 'نستخدم الكوكيز لتحسين تجربة المستخدم.'
          : 'We use cookies to improve user experience.'}
      </p>

      <h3>{lang === 'ar' ? 'ما هي الكوكيز؟' : 'What are cookies?'}</h3>
      <p>
        {lang === 'ar'
          ? 'هي ملفات صغيرة يتم تخزينها على جهاز المستخدم.'
          : 'Cookies are small files stored on your device.'}
      </p>

      <h3>{lang === 'ar' ? 'كيفية استخدامها' : 'How we use cookies'}</h3>
      <p>
        {lang === 'ar'
          ? 'نستخدمها لحفظ التفضيلات وتحليل الاستخدام.'
          : 'Used to store preferences and analyze usage.'}
      </p>

      <p style={{ marginTop: 30, fontSize: 13 }}>
        {lang === 'ar' ? 'آخر تحديث: 2025' : 'Last updated: 2025'}
      </p>

    </LegalLayout>
  )
}

export default Cookies