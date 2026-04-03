// src/pages/legal/AML.jsx
import useLang from '../../context/useLang'
import LegalLayout from './LegalLayout'

function AML() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <LegalLayout>
      {isAr ? (
        <>
          <div className="highlight-box">
            <strong>التزام راسخ:</strong> تلتزم Number 1 Exchange بأعلى معايير مكافحة غسيل الأموال
            وتمويل الإرهاب (AML/CTF)، وبالتحقق الكامل من هوية جميع عملائنا (KYC) وفق المتطلبات الدولية.
          </div>

          <h2>نظرة عامة على السياسة</h2>
          <p>
            تُطبّق المنصة نهجاً متكاملاً قائماً على تقييم المخاطر، يشمل الفحص الآلي للمعاملات
            والمراجعة اليدوية عند الضرورة. هذه السياسة مبنية على التشريعات الدولية ومتطلبات
            مجموعة العمل المالي (FATF) وتُحدَّث بانتظام.
          </p>

          <h2>إجراءات معرفة العميل (KYC)</h2>
          <h3>المستوى الأول — التحقق الأساسي</h3>
          <p>مطلوب لجميع المستخدمين عند التسجيل:</p>
          <ul>
            <li>التحقق من البريد الإلكتروني ورقم الهاتف.</li>
            <li>توفير بيانات شخصية كاملة (الاسم، تاريخ الميلاد، الجنسية).</li>
            <li>رفع صورة من وثيقة هوية رسمية سارية المفعول.</li>
          </ul>

          <h3>المستوى الثاني — التحقق المعزز (EDD)</h3>
          <p>مطلوب للمعاملات التي تتجاوز الحدود المحددة أو عند ارتفاع مستوى المخاطر:</p>
          <ul>
            <li>التحقق البيومتري (selfie مع الهوية).</li>
            <li>إثبات عنوان الإقامة (فاتورة خدمات لا تتجاوز 3 أشهر).</li>
            <li>إثبات مصدر الأموال وثروة العميل.</li>
            <li>فحص الشخصيات المعرّضة سياسياً (PEP Screening).</li>
            <li>فحص قوائم العقوبات الدولية (OFAC, UN, EU).</li>
          </ul>

          <h2>تقييم المخاطر ورصد المعاملات</h2>
          <table>
            <thead>
              <tr><th>مستوى المخاطر</th><th>المؤشرات</th><th>الإجراء</th></tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: '#22c55e' }}>منخفض</td>
                <td>مستخدم موثق، معاملات اعتيادية</td>
                <td>معالجة فورية</td>
              </tr>
              <tr>
                <td style={{ color: '#f59e0b' }}>متوسط</td>
                <td>معاملات غير اعتيادية أو دول ذات مخاطر</td>
                <td>مراجعة إضافية</td>
              </tr>
              <tr>
                <td style={{ color: '#ef4444' }}>عالٍ</td>
                <td>نشاط مشبوه أو مصادر مجهولة</td>
                <td>تعليق فوري + مراجعة</td>
              </tr>
              <tr>
                <td style={{ color: '#dc2626', fontWeight: 700 }}>حرج</td>
                <td>تطابق مع قوائم عقوبات / إرهاب</td>
                <td>إيقاف نهائي + إبلاغ</td>
              </tr>
            </tbody>
          </table>

          <h2>مؤشرات النشاط المشبوه</h2>
          <p>تراقب المنصة تلقائياً المؤشرات التالية:</p>
          <ul>
            <li>المعاملات المُجزّأة بشكل يوحي بالتحايل على الحدود.</li>
            <li>التحويلات المتكررة لجهات متعددة في فترة قصيرة.</li>
            <li>التدفقات النقدية من/إلى عناوين مدرجة على قوائم المراقبة.</li>
            <li>عدم تطابق حجم المعاملات مع النشاط الاقتصادي المعلن.</li>
            <li>استخدام شبكات VPN أو Tor لإخفاء الموقع الجغرافي.</li>
          </ul>

          <h2>تعليق المعاملات وإيقافها</h2>
          <div className="warn-box">
            ⚠️ في حالة تعليق معاملتك، ستتلقى إشعاراً فورياً بالأسباب المتاحة قانونياً.
            يحق لك تقديم الوثائق اللازمة خلال المهلة المحددة.
          </div>
          <p>
            تُعلَّق المعاملة تلقائياً عند تجاوز حدود المخاطر المحددة. يمكن رفعها بعد:
          </p>
          <ul>
            <li>تقديم المستندات المطلوبة خلال <strong>10 أيام عمل</strong>.</li>
            <li>إتمام مراجعة فريق الامتثال الداخلي.</li>
            <li>الحصول على موافقة مسؤول الامتثال الأول.</li>
          </ul>

          <h2>مواعيد التحقق</h2>
          <table>
            <thead>
              <tr><th>نوع التحقق</th><th>المدة المعتادة</th><th>الحد الأقصى</th></tr>
            </thead>
            <tbody>
              <tr><td>التحقق الأساسي (المستوى 1)</td><td>فوري — 24 ساعة</td><td>3 أيام</td></tr>
              <tr><td>التحقق المعزز (المستوى 2)</td><td>2-5 أيام عمل</td><td>10 أيام</td></tr>
              <tr><td>المراجعة الخاصة بالمخاطر العالية</td><td>5-15 يوم عمل</td><td>30 يوماً</td></tr>
            </tbody>
          </table>

          <h2>الإبلاغ عن النشاط المشبوه (SAR)</h2>
          <p>
            تلتزم المنصة بالإبلاغ الفوري عن أي نشاط مشبوه للجهات التنظيمية المختصة
            وفق المتطلبات القانونية المحلية والدولية، بما في ذلك وحدات الاستخبارات المالية (FIU).
            يُنفَّذ هذا الإجراء بسرية تامة دون إخطار صاحب الحساب.
          </p>

          <h2>التدريب والمراجعة الدورية</h2>
          <p>
            يخضع فريق الامتثال لدينا لتدريب دوري مكثف. تُراجع هذه السياسة سنوياً على الأقل
            أو عند صدور تحديثات تنظيمية جديدة لضمان التوافق الكامل مع أحدث المتطلبات الدولية.
          </p>
        </>
      ) : (
        <>
          <div className="highlight-box">
            <strong>Firm Commitment:</strong> Number 1 Exchange maintains the highest standards for
            Anti-Money Laundering and Counter-Terrorist Financing (AML/CTF), and comprehensive
            Know Your Customer (KYC) verification per international requirements.
          </div>

          <h2>Policy Overview</h2>
          <p>
            We apply a comprehensive risk-based approach, including automated transaction monitoring
            and manual review where necessary. This policy is aligned with FATF guidelines and updated regularly.
          </p>

          <h2>KYC Procedures</h2>
          <h3>Level 1 — Basic Verification</h3>
          <ul>
            <li>Email and phone number verification.</li>
            <li>Full personal details (name, date of birth, nationality).</li>
            <li>Upload of a valid government-issued ID document.</li>
          </ul>

          <h3>Level 2 — Enhanced Due Diligence (EDD)</h3>
          <ul>
            <li>Biometric verification (selfie with ID).</li>
            <li>Proof of address (utility bill within 3 months).</li>
            <li>Source of funds and wealth documentation.</li>
            <li>PEP Screening.</li>
            <li>Sanctions list screening (OFAC, UN, EU).</li>
          </ul>

          <h2>Risk Assessment Matrix</h2>
          <table>
            <thead>
              <tr><th>Risk Level</th><th>Indicators</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr><td style={{ color: '#22c55e' }}>Low</td><td>Verified user, routine transactions</td><td>Instant processing</td></tr>
              <tr><td style={{ color: '#f59e0b' }}>Medium</td><td>Unusual patterns or high-risk countries</td><td>Additional review</td></tr>
              <tr><td style={{ color: '#ef4444' }}>High</td><td>Suspicious activity or unknown sources</td><td>Immediate suspension</td></tr>
              <tr><td style={{ color: '#dc2626', fontWeight: 700 }}>Critical</td><td>Sanctions list match</td><td>Permanent block + report</td></tr>
            </tbody>
          </table>

          <h2>Transaction Suspension</h2>
          <div className="warn-box">
            ⚠️ If your transaction is suspended, you will receive an immediate notification with available legal reasons.
            You have the right to submit required documentation within the specified timeframe.
          </div>

          <h2>Reporting (SAR)</h2>
          <p>
            We are obligated to report suspicious activity to relevant authorities including
            Financial Intelligence Units (FIUs) per local and international legal requirements.
            This is done confidentially without notifying the account holder.
          </p>
        </>
      )}
    </LegalLayout>
  )
}

export default AML
