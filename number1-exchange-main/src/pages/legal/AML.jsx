import useLang from '../../context/useLang'
import LegalLayout from './LegalLayout'

function AML() {
  const { lang } = useLang()

  return (
<LegalLayout title={lang === 'ar'
  ? 'سياسة مكافحة غسيل الأموال (AML/KYC)'
  : 'AML / KYC Policy'}>

  <h3>
    {lang === 'ar'
      ? 'سياسة مكافحة غسيل الأموال والتحقق من المستخدم'
      : 'Anti-Money Laundering and Customer Due Diligence Policy'}
  </h3>

  <p>
    {lang === 'ar'
      ? 'تحدد هذه السياسة إجراءات مراجعة المعاملات والتحقق من المستخدمين، بالإضافة إلى تقييم المخاطر لتحديد ما إذا كان يجب تنفيذ أو تعليق أو مراجعة المعاملة.'
      : 'This Policy defines the procedures for transaction monitoring, user verification, and risk assessment to determine whether a transaction should be processed, suspended, or reviewed.'}
  </p>

  <h4>1. {lang === 'ar' ? 'الأحكام العامة' : 'General Provisions'}</h4>
  <p>
    {lang === 'ar'
      ? 'تتبع المنصة نهجًا قائمًا على المخاطر، حيث يتم تحليل كل معاملة تلقائيًا وقد يتم مراجعتها يدويًا.'
      : 'The platform applies a risk-based approach. Each transaction may be automatically and manually reviewed.'}
  </p>

  <h4>2. {lang === 'ar' ? 'تقييم المخاطر' : 'Risk Assessment'}</h4>
  <p>
    {lang === 'ar'
      ? 'يتم تقييم المعاملات بناءً على مستوى المخاطر، بما في ذلك مصادر الأموال والأنشطة المشبوهة.'
      : 'Transactions are evaluated based on risk level, including source of funds and suspicious activity.'}
  </p>

  <ul>
    <li>{lang === 'ar' ? 'مخاطر عالية جداً تؤدي إلى إيقاف فوري' : 'Very high risk leads to automatic suspension'}</li>
    <li>{lang === 'ar' ? 'مخاطر عالية قد تتطلب مراجعة إضافية' : 'High risk may require additional review'}</li>
  </ul>

  <h4>3. {lang === 'ar' ? 'إيقاف المعاملات' : 'Transaction Suspension'}</h4>
  <p>
    {lang === 'ar'
      ? 'قد يتم إيقاف المعاملة في حال تجاوز مستوى المخاطر أو وجود نشاط مشبوه.'
      : 'Transactions may be suspended if risk thresholds are exceeded or suspicious activity is detected.'}
  </p>

  <h4>4. {lang === 'ar' ? 'التحقق من المستخدم (KYC)' : 'User Verification (KYC)'}</h4>
  <ul>
    <li>{lang === 'ar' ? 'توثيق الهوية' : 'Identity verification'}</li>
    <li>{lang === 'ar' ? 'التحقق من مصدر الأموال' : 'Source of funds verification'}</li>
    <li>{lang === 'ar' ? 'طلب معلومات إضافية عند الحاجة' : 'Additional information may be requested'}</li>
  </ul>

  <h4>5. {lang === 'ar' ? 'مدة التحقق' : 'Verification Timeframes'}</h4>
  <p>
    {lang === 'ar'
      ? 'يجب على المستخدم تقديم المعلومات خلال 10 أيام عمل، وقد تستغرق المراجعة الإضافية حتى 30 يومًا.'
      : 'Users must provide requested information within 10 business days. Additional review may take up to 30 days.'}
  </p>

  <h4>6. {lang === 'ar' ? 'الاسترداد' : 'Refunds'}</h4>
  <p>
    {lang === 'ar'
      ? 'لا يتم تنفيذ الاسترداد تلقائيًا، ويتم فقط بعد إكمال إجراءات التحقق.'
      : 'Refunds are not automatic and are processed only after verification is completed.'}
  </p>

  <h4>7. {lang === 'ar' ? 'المنصات المحظورة' : 'Prohibited Platforms'}</h4>
  <p>
    {lang === 'ar'
      ? 'لا تقبل المنصة الأموال المرتبطة بمصادر عالية المخاطر أو خاضعة للعقوبات.'
      : 'The platform does not accept funds linked to high-risk or sanctioned sources.'}
  </p>

  <p style={{ marginTop: 30, fontSize: 13 }}>
    {lang === 'ar' ? 'آخر تحديث: 2026' : 'Last updated: 2026'}
  </p>

</LegalLayout>
  )
}

export default AML