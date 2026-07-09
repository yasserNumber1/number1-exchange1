import { DEFAULT_SOCIAL_IMAGE, SITE_NAME, toAbsoluteUrl } from './site'

const routeSeo = {
  '/': {
    title: 'Number1 Exchange | شراء وبيع USDT في مصر',
    description: 'منصة Number1 Exchange لشراء وبيع USDT وتحويلات المحافظ الإلكترونية في مصر بسرعة وشفافية ودعم مباشر.',
  },
  '/about': {
    title: 'من نحن | Number1 Exchange',
    description: 'تعرف على Number1 Exchange وطريقة عمل المنصة وخطوات الأمان والدعم والخدمات التي نقدمها لعمليات تبادل USDT.',
  },
  '/faq': {
    title: 'الأسئلة الشائعة | Number1 Exchange',
    description: 'إجابات واضحة عن شراء وبيع USDT، أوقات التحويل، التحقق، التتبع، والدعم في منصة Number1 Exchange.',
  },
  '/how-it-works': {
    title: 'كيف تعمل المنصة | Number1 Exchange',
    description: 'شرح خطوة بخطوة لكيفية تنفيذ طلبات شراء وبيع USDT والتحويل عبر Number1 Exchange بطريقة سهلة وآمنة.',
  },
  '/contact': {
    title: 'تواصل معنا | Number1 Exchange',
    description: 'تواصل مع فريق Number1 Exchange عبر تيليجرام أو واتساب أو البريد الإلكتروني للحصول على دعم سريع ومباشر.',
  },
  '/reviews': {
    title: 'آراء العملاء | Number1 Exchange',
    description: 'اطلع على تجارب وآراء العملاء حول سرعة التنفيذ وجودة الدعم وتجربة استخدام منصة Number1 Exchange.',
  },
  '/rates': {
    title: 'أسعار الصرف | Number1 Exchange',
    description: 'تابع أسعار الصرف المعروضة على Number1 Exchange لعمليات تبادل العملات الرقمية والمحافظ الإلكترونية.',
  },
  '/services': {
    title: 'USDT Exchange Services | Number1 Exchange',
    description: 'Buy and sell USDT TRC20, exchange supported e-wallet balances, and track digital currency orders through Number1 Exchange.',
  },
  '/blog': {
    title: 'USDT Exchange Guides | Number1 Exchange',
    description: 'Guides about buying and selling USDT, TRC20 transfers, exchange rates, order tracking, and safer digital currency exchange.',
  },
  '/terms': {
    title: 'شروط الخدمة | Number1 Exchange',
    description: 'اقرأ شروط استخدام منصة Number1 Exchange والخدمات المرتبطة بعمليات التبادل والتحويل.',
  },
  '/privacy': {
    title: 'سياسة الخصوصية | Number1 Exchange',
    description: 'تعرف على كيفية جمع واستخدام وحماية بيانات المستخدمين في منصة Number1 Exchange.',
  },
  '/aml': {
    title: 'سياسة AML/KYC | Number1 Exchange',
    description: 'اطلع على سياسة مكافحة غسيل الأموال والتحقق من الهوية المعتمدة في Number1 Exchange.',
  },
  '/cookies': {
    title: 'سياسة الكوكيز | Number1 Exchange',
    description: 'تعرف على كيفية استخدام ملفات تعريف الارتباط في موقع Number1 Exchange.',
  },
}

export const PRERENDER_ROUTES = [
  '/',
  '/about',
  '/faq',
  '/how-it-works',
  '/contact',
  '/reviews',
  '/rates',
  '/services',
  '/blog',
]

export const BREADCRUMB_LABELS = {
  '/about': 'من نحن',
  '/faq': 'الأسئلة الشائعة',
  '/how-it-works': 'كيف تعمل المنصة',
  '/contact': 'تواصل معنا',
  '/reviews': 'آراء العملاء',
  '/rates': 'أسعار الصرف',
  '/services': 'Services',
  '/blog': 'Guides',
  '/terms': 'شروط الخدمة',
  '/privacy': 'سياسة الخصوصية',
  '/aml': 'سياسة AML/KYC',
  '/cookies': 'سياسة الكوكيز',
}

export function getRouteSeo(pathname) {
  const route = routeSeo[pathname]
  const isKnownRoute = Boolean(route)
  const resolvedRoute = route || {
    title: `${SITE_NAME} | تبادل العملات الرقمية`,
    description: 'منصة Number1 Exchange لتبادل العملات الرقمية والتحويلات الإلكترونية.',
  }

  return {
    ...resolvedRoute,
    canonical: toAbsoluteUrl(isKnownRoute ? pathname : '/'),
    ogTitle: resolvedRoute.title,
    ogDescription: resolvedRoute.description,
    ogImage: DEFAULT_SOCIAL_IMAGE,
    robots: isKnownRoute ? 'index,follow' : 'noindex,follow',
  }
}
