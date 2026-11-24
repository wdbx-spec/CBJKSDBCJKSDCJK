import React from 'react';
import { Settings, Music, Volume2, ShieldCheck, Sparkles } from 'lucide-react';
import { VoiceSettings } from '../types';

interface HeaderProps {
  settings: VoiceSettings;
  onOpenSettings: () => void;
  onToggleSoundtrack: () => void;
  showSoundtrack: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onToggleSoundtrack,
  showSoundtrack,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0A0E17]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
              <span className="text-xl font-black text-slate-950 tracking-tighter">و.م</span>
            </div>
            <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0A0E17] rounded-full" title="جاهز للإنتاج" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                قناة «وراء المال»
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                  استوديو التعليق الصوتي
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>الهوية الصوتية الثابتة:</span>
              <strong className="text-slate-200 font-semibold">{settings.voice}</strong>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 font-mono text-[11px]">24kHz WAV Studio</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Soundtrack button */}
          <button
            onClick={onToggleSoundtrack}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 border ${
              showSoundtrack
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-200 shadow-sm shadow-purple-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/70 text-slate-300 hover:text-white'
            }`}
            title="توليد موسيقى تصويرية للوثائقي"
          >
            <Music className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">الموسيقى التصويرية</span>
            <span className="sm:hidden">الموسيقى</span>
            <span className="text-[10px] bg-purple-500/20 px-1 rounded text-purple-300">Lyria</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 transition-all flex items-center gap-1.5 shadow-sm"
            title="تعديل إعدادات الصوت"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>⚙️ الإعدادات</span>
          </button>
        </div>
      </div>
    </header>
  );
};
