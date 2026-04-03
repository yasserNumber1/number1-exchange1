// src/pages/legal/Privacy.jsx
import useLang from '../../context/useLang'
import LegalLayout from './LegalLayout'

function Privacy() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <LegalLayout>
      {isAr ? (
        <>
          <div className="highlight-box">
            <strong>التزامنا بخصوصيتك:</strong> نحن في Number 1 Exchange نُولي خصوصيتك الأهمية القصوى.
            توضح هذه السياسة بشفافية كاملة كيفية جمع بياناتك واستخدامها وحمايتها.
          </div>

          <h2>البيانات التي نجمعها</h2>
          <p>نجمع أنواعاً مختلفة من البيانات لتشغيل خدماتنا وتحسينها:</p>

          <h3>بيانات الهوية والحساب</h3>
          <ul>
            <li>الاسم الكامل، تاريخ الميلاد، الجنسية.</li>
            <li>البريد الإلكتروني ورقم الهاتف.</li>
            <li>وثائق الهوية الرسمية (جواز السفر، بطاقة الهوية).</li>
            <li>صورة شخصية للتحقق البيومتري.</li>
          </ul>

          <h3>بيانات المعاملات</h3>
          <ul>
            <li>تفاصيل عمليات التحويل والصرف والمدفوعات.</li>
            <li>عناوين المحافظ الرقمية.</li>
            <li>سجل المعاملات والفواتير.</li>
          </ul>

          <h3>البيانات التقنية</h3>
          <ul>
            <li>عنوان IP ومعرّف الجهاز.</li>
            <li>نوع المتصفح ونظام التشغيل.</li>
            <li>بيانات الاستخدام والتصفح داخل المنصة.</li>
            <li>ملفات الكوكيز وبيانات الجلسة.</li>
          </ul>

          <h2>كيف نستخدم بياناتك</h2>
          <table>
            <thead>
              <tr><th>الغرض</th><th>الأساس القانوني</th></tr>
            </thead>
            <tbody>
              <tr><td>تقديم الخدمات وتنفيذ المعاملات</td><td>تنفيذ العقد</td></tr>
              <tr><td>التحقق من الهوية ومكافحة الغش</td><td>الالتزام القانوني</td></tr>
              <tr><td>الامتثال لقوانين AML/KYC</td><td>الالتزام القانوني</td></tr>
              <tr><td>تحسين الخدمات والتجربة</td><td>المصلحة المشروعة</td></tr>
              <tr><td>إرسال الإشعارات والتنبيهات المهمة</td><td>تنفيذ العقد</td></tr>
              <tr><td>التسويق والعروض (بموافقتك)</td><td>الموافقة</td></tr>
            </tbody>
          </table>

          <h2>مشاركة البيانات مع أطراف ثالثة</h2>
          <p>
            لا نبيع بياناتك الشخصية ولا نؤجرها لأي جهة. قد نشارك بعض البيانات في الحالات التالية:
          </p>
          <ul>
            <li><strong>مزودو الخدمات:</strong> شركاء تقنيون يساعدوننا في تشغيل المنصة (مزودو الخادم، معالجو المدفوعات) وفق اتفاقيات سرية صارمة.</li>
            <li><strong>الجهات الرقابية:</strong> عند وجود التزام قانوني مثل طلبات FINTRAC أو الجهات المالية المختصة.</li>
            <li><strong>الشركاء الموثوقون:</strong> لإتمام المعاملات عبر الشبكات المالية المرتبطة.</li>
          </ul>

          <h2>تخزين البيانات وحمايتها</h2>
          <div className="highlight-box">
            <strong>معايير الأمان:</strong> نستخدم تشفير AES-256 لحماية بياناتك المخزنة،
            وبروتوكول TLS 1.3 لتأمين نقل البيانات، مع إجراء اختبارات أمنية دورية.
          </div>
          <p>
            يتم تخزين بياناتك على خوادم آمنة في مراكز بيانات معتمدة بمعايير ISO 27001.
            نُطبّق ضوابط صارمة للوصول ومراقبة مستمرة لأي نشاط مشبوه.
          </p>

          <h3>مدة الاحتفاظ بالبيانات</h3>
          <ul>
            <li>بيانات الحساب: طوال مدة إبقاء الحساب نشطاً + 5 سنوات بعد إغلاقه.</li>
            <li>سجلات المعاملات: 7 سنوات وفق متطلبات AML.</li>
            <li>بيانات الكوكيز: وفق مدة كل نوع (راجع سياسة الكوكيز).</li>
          </ul>

          <h2>حقوقك</h2>
          <p>وفق أنظمة حماية البيانات المعمول بها، تتمتع بالحقوق التالية:</p>
          <ul>
            <li><strong>الوصول:</strong> طلب نسخة من بياناتك الشخصية التي نحتفظ بها.</li>
            <li><strong>التصحيح:</strong> تحديث أو تصحيح بياناتك غير الدقيقة.</li>
            <li><strong>الحذف:</strong> طلب حذف بياناتك (مع مراعاة الالتزامات القانونية).</li>
            <li><strong>الاعتراض:</strong> رفض معالجة بياناتك لأغراض تسويقية.</li>
            <li><strong>النقل:</strong> الحصول على بياناتك بصيغة قابلة للنقل.</li>
          </ul>
          <p>لممارسة أي من هذه الحقوق، راسلنا على: <a href="mailto:privacy@number1.exchange">privacy@number1.exchange</a></p>

          <h2>ملفات الكوكيز</h2>
          <p>
            نستخدم ملفات الكوكيز لتحسين تجربتك. لمزيد من التفاصيل، راجع
            <a href="/cookies" style={{ marginRight: 4, marginLeft: 4 }}>سياسة الكوكيز</a>
            المستقلة.
          </p>

          <h2>تواصل معنا</h2>
          <p>
            لأي استفسارات تتعلق بخصوصيتك، يمكنك التواصل مع مسؤول حماية البيانات لدينا:
          </p>
          <div className="highlight-box">
            <strong>البريد الإلكتروني:</strong> privacy@number1.exchange<br />
            <strong>وقت الاستجابة:</strong> خلال 72 ساعة من تلقي طلبك
          </div>
        </>
      ) : (
        <>
          <div className="highlight-box">
            <strong>Our Privacy Commitment:</strong> At Number 1 Exchange, your privacy is paramount.
            This policy transparently explains how we collect, use, and protect your data.
          </div>

          <h2>Data We Collect</h2>
          <h3>Identity & Account Data</h3>
          <ul>
            <li>Full name, date of birth, nationality.</li>
            <li>Email address and phone number.</li>
            <li>Official identity documents (passport, national ID).</li>
          </ul>

          <h3>Transaction Data</h3>
          <ul>
            <li>Details of transfers, exchanges, and payments.</li>
            <li>Digital wallet addresses.</li>
            <li>Transaction history and invoices.</li>
          </ul>

          <h3>Technical Data</h3>
          <ul>
            <li>IP address and device identifier.</li>
            <li>Browser type and operating system.</li>
            <li>Usage and navigation data within the platform.</li>
          </ul>

          <h2>How We Use Your Data</h2>
          <table>
            <thead>
              <tr><th>Purpose</th><th>Legal Basis</th></tr>
            </thead>
            <tbody>
              <tr><td>Providing services and processing transactions</td><td>Contract performance</td></tr>
              <tr><td>Identity verification and fraud prevention</td><td>Legal obligation</td></tr>
              <tr><td>AML/KYC compliance</td><td>Legal obligation</td></tr>
              <tr><td>Service improvement</td><td>Legitimate interest</td></tr>
              <tr><td>Marketing communications</td><td>Consent</td></tr>
            </tbody>
          </table>

          <h2>Data Security</h2>
          <div className="highlight-box">
            <strong>Security Standards:</strong> We use AES-256 encryption for stored data,
            TLS 1.3 for data transmission, and conduct regular security audits.
          </div>

          <h2>Your Rights</h2>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data.</li>
            <li><strong>Rectification:</strong> Update or correct inaccurate data.</li>
            <li><strong>Erasure:</strong> Request deletion of your data (subject to legal obligations).</li>
            <li><strong>Objection:</strong> Opt out of marketing communications.</li>
            <li><strong>Portability:</strong> Receive your data in a portable format.</li>
          </ul>
          <p>To exercise any of these rights, contact us at: <a href="mailto:privacy@number1.exchange">privacy@number1.exchange</a></p>
        </>
      )}
    </LegalLayout>
  )
}

export default Privacy
