// src/pages/legal/Terms.jsx
import useLang from '../../context/useLang'
import LegalLayout from './LegalLayout'

function Terms() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <LegalLayout>
      {isAr ? (
        <>
          <div className="highlight-box">
            <strong>ملاحظة هامة:</strong> يُرجى قراءة هذه الشروط بعناية قبل استخدام منصة Number 1 Exchange.
            يُعدّ استخدامك للمنصة موافقةً صريحة على جميع الشروط والأحكام الواردة أدناه.
          </div>

          <h2>مقدمة وقبول الشروط</h2>
          <p>
            مرحباً بك في منصة <strong>Number 1 Exchange</strong> — المنصة الرائدة لتحويل العملات الرقمية والتقليدية
            في المنطقة. تُحكم هذه الشروط والأحكام العلاقة بينك كمستخدم وبين المنصة وجميع خدماتها.
          </p>
          <p>
            بمجرد إنشاء حساب أو إجراء أي معاملة عبر المنصة، فإنك تُقرّ بأنك قرأت هذه الشروط وفهمتها
            ووافقت على الالتزام بها كاملاً.
          </p>

          <h2>تعريفات</h2>
          <table>
            <thead>
              <tr><th>المصطلح</th><th>التعريف</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>المنصة</strong></td><td>موقع Number 1 Exchange وتطبيقاته وخدماته كافة</td></tr>
              <tr><td><strong>المستخدم</strong></td><td>أي شخص طبيعي أو اعتباري يُنشئ حساباً أو يستخدم الخدمات</td></tr>
              <tr><td><strong>المعاملة</strong></td><td>أي عملية تحويل أو صرف أو دفع تتم عبر المنصة</td></tr>
              <tr><td><strong>الرصيد</strong></td><td>المبلغ المتاح في محفظة المستخدم داخل المنصة</td></tr>
            </tbody>
          </table>

          <h2>شروط الأهلية والتسجيل</h2>
          <p>للاستفادة من خدمات المنصة يجب أن تتوافر فيك الشروط التالية:</p>
          <ul>
            <li>أن يكون عمرك <strong>18 عاماً</strong> أو أكثر، أو السن القانونية المعمول بها في بلدك.</li>
            <li>أن تكون قادراً قانونياً على إبرام عقود ملزمة.</li>
            <li>ألا تكون محظوراً من استخدام الخدمات المالية في دولتك.</li>
            <li>أن تُقدّم معلومات صحيحة ودقيقة وكاملة عند التسجيل.</li>
            <li>أن تلتزم بجميع القوانين والأنظمة المحلية والدولية المعمول بها.</li>
          </ul>

          <h2>الخدمات المقدمة</h2>
          <p>تُقدّم المنصة مجموعة من الخدمات المالية الرقمية تشمل:</p>
          <ul>
            <li><strong>تحويل العملات:</strong> صرف العملات الرقمية والتقليدية بأسعار تنافسية.</li>
            <li><strong>المحافظ الرقمية:</strong> حفظ وإدارة الأصول الرقمية بأمان عالٍ.</li>
            <li><strong>تتبع الطلبات:</strong> متابعة حالة جميع معاملاتك في الوقت الفعلي.</li>
            <li><strong>الدعم الفني:</strong> خدمة عملاء متاحة على مدار الساعة.</li>
          </ul>

          <h2>الرسوم والأسعار</h2>
          <div className="highlight-box">
            <strong>تنبيه:</strong> الأسعار والرسوم عرضة للتغيير. يُرجى مراجعة صفحة الأسعار قبل إتمام أي معاملة.
          </div>
          <p>
            تُطبّق المنصة رسوماً على بعض المعاملات وفق جدول الأسعار المُعلن. تُحسب الرسوم كنسبة مئوية
            من قيمة المعاملة وتظهر بوضوح قبل تأكيدك للعملية.
          </p>

          <h2>حقوق الملكية الفكرية</h2>
          <p>
            جميع المحتويات الموجودة على المنصة، بما تشمل الشعارات والتصاميم والبرمجيات والنصوص،
            هي ملكية حصرية لـ Number 1 Exchange أو مرخصة لها. يُحظر نسخها أو توزيعها أو استخدامها
            تجارياً دون إذن كتابي مسبق.
          </p>

          <h2>إخلاء المسؤولية</h2>
          <div className="warn-box">
            ⚠️ تنطوي تداولات العملات الرقمية على مخاطر مالية عالية. قد تخسر جزءاً من أموالك أو كلها.
            لا تستثمر ما لا تستطيع تحمّل خسارته.
          </div>
          <p>
            تُقدَّم الخدمات «كما هي» دون أي ضمانات صريحة أو ضمنية. لا تتحمل المنصة مسؤولية
            الخسائر الناتجة عن تقلبات السوق أو ظروف قاهرة.
          </p>

          <h2>إنهاء الخدمة</h2>
          <p>
            تحتفظ المنصة بحق تعليق أو إنهاء أي حساب في الحالات التالية:
          </p>
          <ul>
            <li>انتهاك أي من هذه الشروط.</li>
            <li>الاشتباه في نشاط احتيالي أو غير مشروع.</li>
            <li>عدم الامتثال لمتطلبات التحقق من الهوية (KYC).</li>
            <li>بناءً على طلب السلطات القانونية المختصة.</li>
          </ul>

          <h2>القانون الحاكم وتسوية النزاعات</h2>
          <p>
            تخضع هذه الشروط لأحكام القانون المعمول به في دولة التسجيل. في حالة نشوء أي نزاع،
            يُسعى أولاً لتسويته بالتراضي، وفي حالة التعذّر يُلجأ إلى التحكيم وفق الأنظمة السارية.
          </p>

          <h2>التعديلات على الشروط</h2>
          <p>
            تحتفظ المنصة بحق تعديل هذه الشروط في أي وقت. سيتم إشعارك عبر البريد الإلكتروني أو
            عبر إشعار على المنصة قبل سريان أي تعديل جوهري بـ <strong>14 يوماً</strong> على الأقل.
            استمرارك في استخدام المنصة بعد سريان التعديلات يُعدّ قبولاً ضمنياً لها.
          </p>
        </>
      ) : (
        <>
          <div className="highlight-box">
            <strong>Important Notice:</strong> Please read these Terms carefully before using Number 1 Exchange.
            Your use of the platform constitutes your explicit agreement to all terms and conditions below.
          </div>

          <h2>Introduction & Acceptance</h2>
          <p>
            Welcome to <strong>Number 1 Exchange</strong> — a leading platform for digital and fiat currency exchange.
            These Terms govern the relationship between you as a user and the platform across all its services.
          </p>

          <h2>Eligibility & Registration</h2>
          <ul>
            <li>You must be at least <strong>18 years old</strong> or the legal age in your jurisdiction.</li>
            <li>You must have full legal capacity to enter binding contracts.</li>
            <li>You must not be prohibited from using financial services in your country.</li>
            <li>You must provide accurate, complete, and current registration information.</li>
          </ul>

          <h2>Services Offered</h2>
          <ul>
            <li><strong>Currency Exchange:</strong> Convert digital and fiat currencies at competitive rates.</li>
            <li><strong>Digital Wallets:</strong> Securely store and manage your digital assets.</li>
            <li><strong>Order Tracking:</strong> Monitor all transactions in real time.</li>
            <li><strong>24/7 Support:</strong> Customer service available around the clock.</li>
          </ul>

          <h2>Fees & Pricing</h2>
          <div className="highlight-box">
            <strong>Note:</strong> Prices and fees are subject to change. Please review the rates page before completing any transaction.
          </div>

          <h2>Intellectual Property</h2>
          <p>
            All content on the platform — including logos, designs, software, and text — is the exclusive property
            of Number 1 Exchange or its licensors. Reproduction or commercial use without written permission is prohibited.
          </p>

          <h2>Disclaimer</h2>
          <div className="warn-box">
            ⚠️ Cryptocurrency trading carries significant financial risk. You may lose part or all of your investment.
            Never invest more than you can afford to lose.
          </div>

          <h2>Termination</h2>
          <p>The platform reserves the right to suspend or terminate any account for:</p>
          <ul>
            <li>Violation of these Terms.</li>
            <li>Suspected fraudulent or illegal activity.</li>
            <li>Failure to comply with KYC/AML requirements.</li>
            <li>Request by competent legal authorities.</li>
          </ul>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by applicable law in the jurisdiction of registration.
            Disputes will first be resolved amicably, and if unresolved, through binding arbitration.
          </p>

          <h2>Amendments</h2>
          <p>
            We may update these Terms at any time. You will be notified via email or platform notice
            at least <strong>14 days</strong> before any material change takes effect.
          </p>
        </>
      )}
    </LegalLayout>
  )
}

export default Terms
