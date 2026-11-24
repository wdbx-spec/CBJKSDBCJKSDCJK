import { VoiceSettings } from '../types';

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voice: 'Charon', // Deep, confident, slightly mysterious, cinematic adult male narrator
  speed: 'normal', // 125-140 words per minute
  expression: 'balanced', // Documentary suspense & storytelling
  format: 'wav', // 24kHz Uncompressed Studio Master
};

export const AVAILABLE_VOICES = [
  {
    id: 'Charon',
    name: 'شارون (Charon) - الافتراضي',
    badge: 'هوية «وراء المال» الرسمية',
    gender: 'رجل بالغ',
    description: 'صوت عميق، واثق، هادئ وغامض. مثالي لسرد أسرار المال، الصفقات السرية، وانهيار الشركات الكبرى.',
    recommended: true,
  },
  {
    id: 'Fenrir',
    name: 'فنرير (Fenrir)',
    badge: 'قوي ومسيطر',
    gender: 'رجل بالغ',
    description: 'نبرة جهورية حازمة ومؤثرة، تناسب تحليلات الأزمات المالية العالمية والحروب الاقتصادية.',
    recommended: false,
  },
  {
    id: 'Puck',
    name: 'باك (Puck)',
    badge: 'ديناميكي وسريع',
    gender: 'شاب',
    description: 'إلقاء حيوي ومرن، يناسب مقاطع الشورتس والقصص السريعة لرواد الأعمال والتكنولوجيا.',
    recommended: false,
  },
  {
    id: 'Zephyr',
    name: 'زفير (Zephyr)',
    badge: 'هادئ واستقصائي',
    gender: 'رجل',
    description: 'صوت دافئ وناعم، مثالي للتقارير الوثائقية الطويلة التي تحتاج تركيزاً هادئاً لساعات.',
    recommended: false,
  },
  {
    id: 'Kore',
    name: 'كوري (Kore)',
    badge: 'صوت نسائي وقور',
    gender: 'امرأة بالغة',
    description: 'نبرة رصينة ومحترفة تشبه مذيعات الوثائقيات العالمية والتحقيقات الاقتصادية الكبرى.',
    recommended: false,
  },
] as const;

export const SAMPLE_SCRIPTS = [
  {
    title: 'لغز اختفاء 50 مليار دولار (برنارد مادوف)',
    category: 'أكبر عملية احتيال',
    text: `في صباح الحادي عشر من ديسمبر عام 2008، كانت وول ستريت تستيقظ على أكبر صدمة في تاريخها المالي الحديث.

رجل واحد... وثق به كبار المستثمرين، والبنوك العالمية، ورؤساء الدول. لكن خلف تلك الابتسامة الهادئة والمكاتب الفارهة في مانهاتن، كان يختبئ سر مروع: لم يكن هناك استثمار حقيقي من الأساس.

كيف استطاع برنارد مادوف أن يخدع العالم بأسره لأكثر من ثلاثة عقود؟ وما هي النقطة التي انهار عندها هرم الرمال الذي ابتلع خمسين مليار دولار بين ليلة وضحاها؟

الحقيقة... أغرب بكثير مما تتخيل.`,
  },
  {
    title: 'سقوط إمبراطورية إنرون',
    category: 'انهيار الشركات',
    text: `كانت تسمى الشركة الأكثر ابتكاراً في أمريكا لست سنوات متتالية. بلغت قيمتها السوقية سبعين مليار دولار، وكان موظفوها يعتقدون أنهم فوق القوانين.

لكن في غضون أربعة وعشرين يوماً فقط... تبخر كل شيء.

دفاتر محاسبية مزيفة، صفقات وهمية، وتواطؤ قاد واحدة من أعتى الشركات العالمية إلى قاع الإفلاس. واليوم، نكشف في «وراء المال» الكواليس السرية التي أسقطت إنرون وزلزلت البورصات العالمية.`,
  },
  {
    title: 'الجانب المظلم لصفقات الاستحواذ',
    category: 'كواليس وول ستريت',
    text: `عندما تسمع عن اندماج تاريخي بمليارات الدولارات في نشرات الأخبار، تظن أنها مجرد لغة أرقام وجداول بيانات.

لكن ما لا تراه الكاميرات هو الحرب الشرسة خلف الأبواب المغلقة: اتصالات ليلية مشبوهة، ضغوط سياسية، ومضاربات سرية ترفع أسهماً وتسحق أخرى في رمشة عين.

من يربح حقاً عندما تتحرك أموال العالم؟ الإجابة ليست في البنوك... بل وراء كواليس المال.`,
  },
];

export const MUSIC_PRESETS = [
  {
    id: 'financial_mystery',
    name: 'غموض وتحقيق مالي مظلم',
    description: 'وتريات منخفضة، نبض إلكتروني خافت، وأجواء تشويق للتحقيقات والمؤامرات الاقتصادية.',
    prompt: 'Dark cinematic suspenseful documentary soundtrack with low cello, pulsating synths, subtle ticking clocks, and deep tension for a financial crime investigation.',
  },
  {
    id: 'market_crash',
    name: 'نبض التوتر وانهيار الأسواق',
    description: 'إيقاع متسارع يحاكي نبضات القلب والعد التنازلي قبل حدوث الكارثة المالية.',
    prompt: 'High tension cinematic orchestral score with ominous strings, heavy dramatic brass and accelerating heartbeat rhythm depicting a massive stock market collapse.',
  },
  {
    id: 'empire_rise',
    name: 'صعود إمبراطوريات الثروة',
    description: 'موسيقى سينمائية هادئة ذات فخامة وهيبة تعكس القوة والنفوذ المالي العابر للحدود.',
    prompt: 'Majestic, brooding corporate cinematic documentary music with deep electronic sub-bass, inspiring piano arpeggio and intriguing narrative mystery.',
  },
  {
    id: 'hook_opener',
    name: 'تتر البداية المشوق (Hook)',
    description: 'مقطع درامي قصير ومكثف لجذب انتباه المشاهد في أول 30 ثانية من الفيديو.',
    prompt: 'Short intense cinematic documentary opening hook, dramatic cymbal swell, deep sub hit, and mysterious ostinato violin build-up.',
  },
];
