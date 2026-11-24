import React, { useRef } from 'react';
import {
  FileText,
  Clock,
  Type,
  Sparkles,
  Clipboard,
  Trash2,
  Bookmark,
  PauseCircle,
  AlertCircle,
} from 'lucide-react';
import { SAMPLE_SCRIPTS } from '../constants/presets';

interface ScriptInputProps {
  text: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ScriptInput: React.FC<ScriptInputProps> = ({
  text,
  onChange,
  onGenerate,
  isGenerating,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  // Approximate duration: 130 words per minute (documentary storytelling pace)
  const estimatedSeconds = Math.round((wordCount / 130) * 60);
  const estMinutes = Math.floor(estimatedSeconds / 60);
  const estSecs = estimatedSeconds % 60;
  const formattedEstTime = `${estMinutes}:${estSecs < 10 ? '0' : ''}${estSecs}`;

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(text ? `${text}\n\n${clipText}` : clipText);
      }
    } catch {
      // In case clipboard permission is denied
      textareaRef.current?.focus();
    }
  };

  const handleClear = () => {
    if (text && confirm('هل أنت متأكد من رغبتك في مسح نص الفيديو؟')) {
      onChange('');
    }
  };

  const insertPause = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const pauseMarker = ' ... [وقفة] ... ';
    const newText = text.substring(0, start) + pauseMarker + text.substring(end);
    onChange(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + pauseMarker.length;
        textareaRef.current.focus();
      }
    }, 10);
  };

  const loadSampleScript = (sampleText: string) => {
    onChange(sampleText);
    textareaRef.current?.focus();
  };

  return (
    <div className="bg-[#0E131F]/90 rounded-2xl border border-slate-800/90 shadow-2xl p-5 sm:p-7 relative overflow-hidden backdrop-blur-sm">
      {/* Decorative subtle ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header of Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              نص الفيديو
            </h2>
            <p className="text-xs text-slate-400">
              ألصق نص الوثائقي هنا لإنتاج تعليق صوتي سينمائي فوري جاهز للمونتاج
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 text-xs bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-slate-300">
          <div className="flex items-center gap-1.5" title="عدد الكلمات">
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span>{wordCount.toLocaleString('ar-EG')} كلمة</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5" title="المدة التقديرية للإلقاء بمعدل 130 كلمة/دقيقة">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>~{formattedEstTime} دقيقة</span>
          </div>
        </div>
      </div>

      {/* Quick Sample Scripts Bar */}
      <div className="mb-3.5 flex flex-wrap items-center gap-2 relative z-10 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-medium">
          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          نماذج سريعة لـ «وراء المال»:
        </span>
        {SAMPLE_SCRIPTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => loadSampleScript(sample.text)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 transition-all text-xs"
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Main Textarea */}
      <div className="relative z-10">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="الصق نص الفيديو هنا..."
          rows={9}
          dir="rtl"
          disabled={isGenerating}
          className="w-full bg-[#080B12] border border-slate-800 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl p-4 sm:p-5 text-slate-100 placeholder-slate-500 text-base leading-relaxed transition-all resize-y outline-none font-normal"
        />

        {/* Textarea quick tools bar */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5 text-amber-400" />
              لصق من الحافظة
            </button>
            <button
              type="button"
              onClick={insertPause}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
              title="إضافة علامة وقفة درامية في موضع المؤشر"
            >
              <PauseCircle className="w-3.5 h-3.5 text-emerald-400" />
              إضافة وقفة درامية
            </button>
            {text && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 text-slate-400 hover:text-rose-300 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                مسح
              </button>
            )}
          </div>

          <div className="hidden sm:block text-slate-500 font-mono text-[11px]">
            {charCount.toLocaleString('ar-EG')} حرف
          </div>
        </div>
      </div>

      {/* Main Action Area: Generate Button / Loading Indicator */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col items-center justify-center relative z-10">
        {isGenerating ? (
          /* Loading State as strictly requested: "جاري توليد التعليق الصوتي..." */
          <div className="w-full max-w-md p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-amber-950/30 border border-amber-500/40 flex flex-col items-center text-center shadow-xl">
            {/* Animated sound wave bars */}
            <div className="flex items-center gap-1.5 h-9 mb-3">
              {[40, 75, 95, 60, 100, 70, 85, 45, 90, 65, 80, 50].map((height, i) => (
                <span
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-amber-600 to-amber-300 rounded-full animate-pulse"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${(i * 0.1).toFixed(2)}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>

            <p className="text-base sm:text-lg font-bold text-amber-300 tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              جاري توليد التعليق الصوتي...
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              يتم الآن تجسيد سرد «وراء المال» الوثائقي بنبرة عميقة وواثقة بصيغة 24kHz WAV
            </p>
          </div>
        ) : (
          /* Main Button: "🎙️ توليد الصوت" */
          <button
            type="button"
            onClick={onGenerate}
            disabled={!text.trim()}
            className={`w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-xl text-base sm:text-lg font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
              text.trim()
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <span className="text-xl">🎙️</span>
            <span>توليد الصوت</span>
          </button>
        )}

        {!text.trim() && !isGenerating && (
          <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            الصق نص الفيديو أولاً أو اختر أحد النماذج الجاهزة أعلاه لتفعيل زر التوليد
          </p>
        )}
      </div>
    </div>
  );
};
