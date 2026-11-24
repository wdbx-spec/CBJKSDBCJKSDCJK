import React from 'react';
import {
  History,
  Download,
  Play,
  Clock,
  FileAudio,
  Check,
  Trash2,
} from 'lucide-react';
import { GeneratedTake } from '../types';

interface TakesHistoryProps {
  takes: GeneratedTake[];
  activeTakeId: string | null;
  onSelectTake: (take: GeneratedTake) => void;
  onClearHistory: () => void;
}

export const TakesHistory: React.FC<TakesHistoryProps> = ({
  takes,
  activeTakeId,
  onSelectTake,
  onClearHistory,
}) => {
  if (takes.length <= 1) return null;

  const downloadTake = (take: GeneratedTake) => {
    try {
      const url = take.audioUrl || URL.createObjectURL(take.blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = take.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#0D121D]/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              سجل التسجيلات (Takes Archive)
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono">
                {takes.length} تسجيلات
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              جميع التوليدات السابقة مع التسمية المتسلسلة الرسمية لقناة «وراء المال»
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-800/60"
          title="مسح سجل التسجيلات"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">مسح السجل</span>
        </button>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {takes.map((take) => {
          const isActive = take.id === activeTakeId;
          return (
            <div
              key={take.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isActive
                  ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onSelectTake(take)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="تشغيل في المشغل الرئيسي"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-100">
                      {take.filename}
                    </span>
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        النشط الآن
                      </span>
                    )}
                    <span className="text-slate-500 text-xs">|</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {formatSeconds(take.durationSeconds)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate mt-1 max-w-md">
                    {take.textSnippet}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => downloadTake(take)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                  title="تحميل هذا التسجيل"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>تحميل</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
