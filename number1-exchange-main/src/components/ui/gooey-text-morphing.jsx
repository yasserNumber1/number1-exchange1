// src/components/ui/gooey-text-morphing.jsx
import * as React from "react";

/**
 * GooeyText — نص متحرك بتأثير "Gooey" (مورفينج سلس بين النصوص)
 *
 * كيف يعمل:
 * - نستخدم مرشح SVG feColorMatrix لجعل الضبابية (blur) تبدو
 *   وكأن النصوص تذوب وتتحول بدلاً من مجرد تلاشي عادي.
 * - نص1 يختفي تدريجياً بينما نص2 يظهر، مع blur حسابي لكل منهما.
 *
 * Props:
 *  texts        — مصفوفة النصوص للتناوب بينها
 *  morphTime    — ثواني انتقال التحويل (افتراضي 1)
 *  cooldownTime — ثواني التوقف بين كل تحويل (افتراضي 0.25)
 *  className    — كلاسات إضافية للغلاف
 *  textClassName — كلاسات إضافية للنصوص
 *  style        — ستايل مباشر للغلاف
 */
export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className = "",
  textClassName = "",
  style = {},
}) {
  const text1Ref = React.useRef(null);
  const text2Ref = React.useRef(null);
  const animFrameRef = React.useRef(null);

  React.useEffect(() => {
    let textIndex = texts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;

    // ضبط درجة الـ blur والشفافية للنصين حسب نسبة التحويل
    const setMorph = (fraction) => {
      if (text1Ref.current && text2Ref.current) {
        // النص الثاني يظهر
        text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
        // النص الأول يختفي
        const inv = 1 - fraction;
        text1Ref.current.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
        text1Ref.current.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
      }
    };

    // حالة الراحة — النص الثاني ظاهر بالكامل، الأول مختفٍ
    const doCooldown = () => {
      morph = 0;
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = "";
        text2Ref.current.style.opacity = "100%";
        text1Ref.current.style.filter = "";
        text1Ref.current.style.opacity = "0%";
      }
    };

    // تشغيل التحويل خطوة بخطوة
    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    // حلقة الأنيميشن الرئيسية
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;
      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % texts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = texts[textIndex % texts.length];
            text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    }

    animate();

    // تنظيف عند إزالة المكوّن من الصفحة
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={`gooey-text-wrapper ${className}`} style={{ position: "relative", ...style }}>
      {/* مرشح SVG — هذا سرّ تأثير الـ Gooey */}
      <svg
        style={{ position: "absolute", width: 0, height: 0 }}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id="gooey-threshold">
            {/*
              feColorMatrix يضخّم قناة الألفا (الشفافية) بشكل قوي جداً (×255)
              ثم يطرح 140 — هذا يجعل المناطق ذات blur متوسط تبدو صلبة
              بدلاً من شفافة، مما يعطي مظهر "الذوبان" بين النصوص
            */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      {/* الحاوية التي يُطبَّق عليها المرشح */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: "url(#gooey-threshold)",
        }}
      >
        <span
          ref={text1Ref}
          className={`gooey-text-span ${textClassName}`}
          style={{
            position: "absolute",
            display: "inline-block",
            userSelect: "none",
            textAlign: "center",
          }}
        />
        <span
          ref={text2Ref}
          className={`gooey-text-span ${textClassName}`}
          style={{
            position: "absolute",
            display: "inline-block",
            userSelect: "none",
            textAlign: "center",
          }}
        />
      </div>
    </div>
  );
}
