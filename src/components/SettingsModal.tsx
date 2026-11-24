import React from 'react';
import {
  X,
  Sliders,
  Check,
  Shield,
  RotateCcw,
  Sparkles,
  Info,
  Mic,
  Gauge,
  Activity,
  FileCheck,
} from 'lucide-react';
import { VoiceSettings } from '../types';
import { AVAILABLE_VOICES, DEFAULT_VOICE_SETTINGS } from '../constants/presets';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onSave: (newSettings: VoiceSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  if (!isOpen) return null;

  const [current, setCurrent] = React.useState<VoiceSettings>({ ...settings });

  const handleResetToDefaults = () => {
    setCurrent({ ...DEFAULT_VOICE_SETTINGS });
  };

  const handleSaveAndClose = () => {
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#0F1420] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ⚙️ إعدادات الصوت المتقدمة
              </h3>
              <p className="text-xs text-slate-400">
                إعدادات هوية قناة «وراء المال» الوثائقية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Channel Identity Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              الإعدادات الافتراضية مضبوطة مسبقاً وفق المعايير الرسمية لقناة <strong className="text-amber-300">«وراء المال»</strong> (صوت وثائقي عميق، سرعة سرد طبيعية، وجودة WAV عالية). نوصي بالاحتفاظ بها لضمان اتساق شخصية الراوي عبر جميع الفيديوهات.
            </p>
          </div>

          {/* 1. Voice Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Mic className="w-4 h-4 text-amber-400" />
              اختيار الصوت (Voice ID)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {AVAILABLE_VOICES.map((v) => {
                const isSelected = current.voice === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setCurrent({ ...current, voice: v.id as any })}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{v.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            v.recommended
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {v.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">
                        {v.description}
                      </p>
                    </div>

                    <div className="mt-1 mr-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 text-slate-950'
                            : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Narration Speed */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              سرعة الإلقاء (Pacing)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'slow',
                  label: 'بطيء وثائقي',
                  sub: '~120 كلمة/د',
                  desc: 'تركيز فائق على الأرقام',
                },
                {
                  id: 'normal',
                  label: 'طبيعي «وراء المال»',
                  sub: '~135 كلمة/د (الافتراضي)',
                  desc: 'إيقاع السرد الوثائقي المثالي',
                },
                {
                  id: 'fast',
                  label: 'سريع وحيوي',
                  sub: '~150 كلمة/د',
                  desc: 'لمقاطع الشورتس السريعة',
                },
              ].map((s) => {
                const isSelected = current.speed === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrent({ ...current, speed: s.id as any })}
                    className={`p-3 rounded-xl border text-center transition ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">{s.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{s.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Expression Level */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Activity className="w-4 h-4 text-amber-400" />
              مستوى التعبير والسرد الدرامي
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'high_suspense',
                  label: 'غموض وتشويق مكثف',
                  desc: 'تركيز على أسرار الجرائم المالية والصفقات المظلمة',
                },
                {
                  id: 'balanced',
                  label: 'وثائقي متوازن (الافتراضي)',
                  desc: 'سرد قصصي رصين ومؤثر مناسب لجميع الفيديوهات',
                },
                {
                  id: 'investigative',
                  label: 'تحقيق استقصائي هادئ',
                  desc: 'إلقاء حيادي ووقور يركز على البيانات والتواريخ',
                },
              ].map((e) => {
                const isSelected = current.expression === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setCurrent({ ...current, expression: e.id as any })}
                    className={`p-3 rounded-xl border text-right transition ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">{e.label}</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{e.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Audio Format */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <FileCheck className="w-4 h-4 text-amber-400" />
              صيغة الملف (Audio Format)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'wav',
                  title: 'WAV Studio Master (الافتراضي)',
                  badge: '24kHz 16-bit Lossless',
                  desc: 'أعلى جودة صوتية، مثالية لبرامج المونتاج مثل Premiere و DaVinci و CapCut دون أي فقدان للجودة.',
                },
                {
                  id: 'mp3',
                  title: 'MP3 High Quality',
                  badge: '320kbps Compressed',
                  desc: 'حجم ملف أصغر، مناسب للمعاينة السريعة والمشاركة عبر الواتساب وتطبيقات المحادثة.',
                },
              ].map((fmt) => {
                const isSelected = current.format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setCurrent({ ...current, format: fmt.id as any })}
                    className={`p-3.5 rounded-xl border text-right transition ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{fmt.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {fmt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{fmt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            استعادة إعدادات «وراء المال» الافتراضية
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md shadow-amber-500/20"
            >
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
