// src/pages/legal/Cookies.jsx
import useLang from '../../context/useLang'
import LegalLayout from './LegalLayout'

function Cookies() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <LegalLayout>
      {isAr ? (
        <>
          <div className="highlight-box">
            <strong>ملاحظة:</strong> نستخدم ملفات الكوكيز وتقنيات مشابهة لضمان حسن عمل المنصة
            وتحسين تجربتك. يمكنك إدارة إعداداتك في أي وقت.
          </div>

          <h2>ما هي ملفات الكوكيز؟</h2>
          <p>
            ملفات الكوكيز هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة موقعنا.
            تُساعدنا هذه الملفات على التعرف عليك كمستخدم، وتذكّر تفضيلاتك، وتحليل
            كيفية استخدامك للمنصة لتحسين خدماتنا باستمرار.
          </p>

          <h2>أنواع الكوكيز التي نستخدمها</h2>

          <h3>أولاً: الكوكيز الضرورية</h3>
          <div className="highlight-box">
            <strong>لا يمكن تعطيلها</strong> — هذه الكوكيز ضرورية لعمل المنصة بشكل صحيح.
          </div>
          <table>
            <thead>
              <tr><th>الكوكي</th><th>الغرض</th><th>مدة البقاء</th></tr>
            </thead>
            <tbody>
              <tr><td><code>session_id</code></td><td>إدارة جلسة المستخدم والمصادقة</td><td>نهاية الجلسة</td></tr>
              <tr><td><code>csrf_token</code></td><td>الحماية من هجمات CSRF</td><td>ساعة واحدة</td></tr>
              <tr><td><code>auth_token</code></td><td>المصادقة على الحساب</td><td>30 يوماً</td></tr>
              <tr><td><code>lang_pref</code></td><td>حفظ تفضيل اللغة</td><td>سنة واحدة</td></tr>
              <tr><td><code>theme_pref</code></td><td>حفظ الوضع المظلم/المضيء</td><td>سنة واحدة</td></tr>
            </tbody>
          </table>

          <h3>ثانياً: كوكيز الأداء والتحليل</h3>
          <p>تساعدنا على فهم كيفية استخدام المنصة وتحسين الأداء.</p>
          <table>
            <thead>
              <tr><th>الكوكي</th><th>الغرض</th><th>مدة البقاء</th></tr>
            </thead>
            <tbody>
              <tr><td><code>_ga</code></td><td>Google Analytics — تتبع الزوار</td><td>سنتان</td></tr>
              <tr><td><code>_gid</code></td><td>Google Analytics — تمييز المستخدمين</td><td>24 ساعة</td></tr>
              <tr><td><code>perf_metrics</code></td><td>قياس أداء الصفحات</td><td>30 يوماً</td></tr>
            </tbody>
          </table>

          <h3>ثالثاً: كوكيز الوظائف والتفضيلات</h3>
          <p>تُمكّنك من الاستفادة من ميزات مخصصة وتذكّر تفضيلاتك.</p>
          <table>
            <thead>
              <tr><th>الكوكي</th><th>الغرض</th><th>مدة البقاء</th></tr>
            </thead>
            <tbody>
              <tr><td><code>currency_pref</code></td><td>العملة الافتراضية المفضلة</td><td>90 يوماً</td></tr>
              <tr><td><code>notification_pref</code></td><td>إعدادات الإشعارات</td><td>90 يوماً</td></tr>
              <tr><td><code>last_visited</code></td><td>آخر صفحة زيارة لتسهيل العودة</td><td>7 أيام</td></tr>
            </tbody>
          </table>

          <h3>رابعاً: كوكيز الأمان</h3>
          <p>تُستخدم لتعزيز أمان حسابك ومنع الوصول غير المصرح به.</p>
          <ul>
            <li>رصد محاولات تسجيل الدخول المشبوهة.</li>
            <li>التحقق من هوية الجهاز المعتاد للمستخدم.</li>
            <li>الكشف عن استخدام VPN أو شبكات مجهولة المصدر.</li>
          </ul>

          <h2>كوكيز الأطراف الثالثة</h2>
          <p>
            قد تُخزَّن بعض الكوكيز من خدمات خارجية نستخدمها لتشغيل المنصة:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> لتحليل حركة الزيارات (يمكن إلغاؤه).</li>
            <li><strong>Cloudflare:</strong> لحماية الموقع وتحسين الأداء (ضروري).</li>
            <li><strong>Intercom / Support Chat:</strong> لتوفير الدعم الفوري (يمكن إلغاؤه).</li>
          </ul>

          <h2>كيف تدير تفضيلات الكوكيز؟</h2>
          <p>لديك خيارات متعددة للتحكم في الكوكيز:</p>

          <h3>من إعدادات المنصة</h3>
          <p>
            يمكنك زيارة صفحة إعدادات الخصوصية في حسابك لإدارة موافقتك على كل نوع
            من الكوكيز الاختيارية بصورة مستقلة.
          </p>

          <h3>من إعدادات المتصفح</h3>
          <p>
            توفر جميع المتصفحات الحديثة إمكانية إدارة أو حذف الكوكيز:
          </p>
          <ul>
            <li><strong>Chrome:</strong> الإعدادات ← الخصوصية والأمان ← ملفات تعريف الارتباط</li>
            <li><strong>Firefox:</strong> الخيارات ← الخصوصية والأمان ← الكوكيز والبيانات</li>
            <li><strong>Safari:</strong> التفضيلات ← الخصوصية ← إدارة الكوكيز</li>
            <li><strong>Edge:</strong> الإعدادات ← الخصوصية والأمان والخدمات</li>
          </ul>

          <div className="warn-box">
            ⚠️ تعطيل الكوكيز الضرورية قد يؤثر سلباً على أداء المنصة ويمنعك من استخدام
            بعض الميزات الأساسية مثل تسجيل الدخول وإتمام المعاملات.
          </div>

          <h2>تحديثات سياسة الكوكيز</h2>
          <p>
            قد نُحدّث هذه السياسة دورياً لتعكس أي تغييرات في الكوكيز المستخدمة أو
            التشريعات المعمول بها. سنُخطرك بأي تغييرات جوهرية عبر إشعار بارز على الموقع.
          </p>
        </>
      ) : (
        <>
          <div className="highlight-box">
            <strong>Note:</strong> We use cookies and similar technologies to ensure proper platform
            operation and enhance your experience. You can manage your settings at any time.
          </div>

          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit our site.
            They help us recognize you, remember your preferences, and analyze how you use the platform.
          </p>

          <h2>Types of Cookies We Use</h2>

          <h3>Essential Cookies</h3>
          <div className="highlight-box">
            <strong>Cannot be disabled</strong> — These are required for the platform to function properly.
          </div>
          <table>
            <thead>
              <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
            </thead>
            <tbody>
              <tr><td><code>session_id</code></td><td>Session management and authentication</td><td>Session</td></tr>
              <tr><td><code>csrf_token</code></td><td>CSRF attack protection</td><td>1 hour</td></tr>
              <tr><td><code>auth_token</code></td><td>Account authentication</td><td>30 days</td></tr>
              <tr><td><code>lang_pref</code></td><td>Language preference</td><td>1 year</td></tr>
            </tbody>
          </table>

          <h3>Analytics Cookies</h3>
          <table>
            <thead>
              <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
            </thead>
            <tbody>
              <tr><td><code>_ga</code></td><td>Google Analytics — visitor tracking</td><td>2 years</td></tr>
              <tr><td><code>_gid</code></td><td>Google Analytics — user differentiation</td><td>24 hours</td></tr>
            </tbody>
          </table>

          <h2>Managing Cookie Preferences</h2>
          <p>You can manage cookies through your browser settings:</p>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy & Security → Cookies</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Cookies</li>
            <li><strong>Edge:</strong> Settings → Privacy, Search & Services</li>
          </ul>

          <div className="warn-box">
            ⚠️ Disabling essential cookies may impair platform performance and prevent
            access to core features such as login and transaction completion.
          </div>
        </>
      )}
    </LegalLayout>
  )
}

export default Cookies
