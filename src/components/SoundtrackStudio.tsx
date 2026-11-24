import React, { useState, useRef } from 'react';
import {
  Music,
  Sparkles,
  Play,
  Pause,
  Download,
  Volume2,
  Sliders,
  Check,
  Disc3,
  Flame,
  Radio,
} from 'lucide-react';
import { MUSIC_PRESETS } from '../constants/presets';
import { GeneratedMusic, GeneratedTake } from '../types';

interface SoundtrackStudioProps {
  currentTake: GeneratedTake | null;
  onClose: () => void;
}

export const SoundtrackStudio: React.FC<SoundtrackStudioProps> = ({
  currentTake,
  onClose,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('financial_mystery');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [modelType, setModelType] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedMusic[]>([]);
  const [activeTrack, setActiveTrack] = useState<GeneratedMusic | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mixer simulation: Play voiceover + background music simultaneously
  const [isMixPlaying, setIsMixPlaying] = useState<boolean>(false);
  const [musicDuckingVolume, setMusicDuckingVolume] = useState<number>(0.25); // Ducked under voice

  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceMixAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicMixAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerateMusic = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    const presetObj = MUSIC_PRESETS.find(p => p.id === selectedPreset);
    const finalPrompt = customPrompt.trim() || presetObj?.prompt || 'Dark cinematic suspenseful documentary soundtrack for financial thriller.';

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          model: modelType,
          preset: selectedPreset,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في توليد الموسيقى التصويرية.');
      }

      // Convert base64 to Blob & URL
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      const newTrack: GeneratedMusic = {
        id: `track-${Date.now()}`,
        title: presetObj ? presetObj.name : 'موسيقى وثائقية مخصصة',
        prompt: finalPrompt,
        audioBase64: data.audioBase64,
        audioUrl,
        blob,
        filename: data.filename || `waraa_almal_soundtrack_${Date.now()}.wav`,
        model: data.model || modelType,
        createdAt: new Date(),
      };

      setGeneratedTracks(prev => [newTrack, ...prev]);
      setActiveTrack(newTrack);
    } catch (err: any) {
      console.error('Music generation error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال بموديل Lyria للموسيقى.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayMusic = () => {
    if (!musicAudioRef.current) return;
    if (isPlayingMusic) {
      musicAudioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      musicAudioRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  const handleMixPreview = () => {
    if (!voiceMixAudioRef.current || !musicMixAudioRef.current) return;

    if (isMixPlaying) {
      voiceMixAudioRef.current.pause();
      musicMixAudioRef.current.pause();
      voiceMixAudioRef.current.currentTime = 0;
      musicMixAudioRef.current.currentTime = 0;
      setIsMixPlaying(false);
    } else {
      voiceMixAudioRef.current.currentTime = 0;
      musicMixAudioRef.current.currentTime = 0;
      musicMixAudioRef.current.volume = musicDuckingVolume;
      voiceMixAudioRef.current.volume = 1.0;

      Promise.all([
        voiceMixAudioRef.current.play(),
        musicMixAudioRef.current.play(),
      ]).then(() => {
        setIsMixPlaying(true);
      }).catch(err => console.error('Mix playback error:', err));
    }
  };

  const downloadTrack = (track: GeneratedMusic) => {
    try {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = track.audioUrl;
      a.download = track.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download music failed:', e);
    }
  };

  return (
    <div className="bg-[#0B101C] rounded-2xl border border-purple-500/30 p-5 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
            <Music className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                استوديو الموسيقى التصويرية الوثائقية
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold font-mono">
                Lyria AI Music
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              توليد خلفيات موسيقية سينمائية تناسب قصص المال والغموض لتدمجها مباشرة مع التعليق الصوتي
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 border border-slate-800 transition"
        >
          إغلاق الاستوديو
        </button>
      </div>

      {/* Preset selection & Prompt */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <Disc3 className="w-4 h-4 text-purple-400" />
            أنماط الموسيقى الوثائقية لقناة «وراء المال»
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MUSIC_PRESETS.map((p) => {
              const isSelected = selectedPreset === p.id && !customPrompt.trim();
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(p.id);
                    setCustomPrompt('');
                  }}
                  className={`p-3 rounded-xl border text-right transition ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-sm text-purple-200">{p.name}</div>
                  <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Type Selector */}
        <div className="flex items-center gap-4 text-xs bg-slate-900/70 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-medium">نوع التوليد (Lyria Model):</span>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="radio"
              name="modelType"
              value="lyria-3-clip-preview"
              checked={modelType === 'lyria-3-clip-preview'}
              onChange={() => setModelType('lyria-3-clip-preview')}
              className="accent-purple-500"
            />
            <span>مقطع قصير 30 ثانية (lyria-3-clip-preview)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="radio"
              name="modelType"
              value="lyria-3-pro-preview"
              checked={modelType === 'lyria-3-pro-preview'}
              onChange={() => setModelType('lyria-3-pro-preview')}
              className="accent-purple-500"
            />
            <span>تراك كامل (lyria-3-pro-preview)</span>
          </label>
        </div>

        {/* Generate Button & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleGenerateMusic}
            disabled={isGenerating}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              isGenerating
                ? 'bg-purple-900 text-purple-300 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <Disc3 className="w-5 h-5 animate-spin" />
                <span>جاري تأليف وتوليد الموسيقى التصويرية...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>توليد الموسيقى التصويرية</span>
              </>
            )}
          </button>

          {errorMessage && (
            <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2 rounded-lg">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Active Track Player */}
        {activeTrack && (
          <div className="mt-5 p-4 rounded-xl bg-purple-950/20 border border-purple-500/40">
            <audio
              ref={musicAudioRef}
              src={activeTrack.audioUrl}
              onEnded={() => setIsPlayingMusic(false)}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-purple-400 font-medium">الموسيقى الناتجة:</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeTrack.title}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{activeTrack.filename}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayMusic}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {isPlayingMusic ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>إيقاف الموسيقى</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                      <span>تشغيل الموسيقى</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => downloadTrack(activeTrack)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30 font-medium text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>تحميل الموسيقى</span>
                </button>
              </div>
            </div>

            {/* Voice + Music Simultaneous Mixer Preview */}
            {currentTake && (
              <div className="mt-4 pt-3.5 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-purple-950/30 p-3 rounded-lg">
                {/* Audio elements for mixer */}
                <audio
                  ref={voiceMixAudioRef}
                  src={currentTake.audioUrl}
                  onEnded={() => setIsMixPlaying(false)}
                />
                <audio
                  ref={musicMixAudioRef}
                  src={activeTrack.audioUrl}
                  loop
                />

                <div className="flex items-center gap-2 text-xs">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-200">معاينة المونتاج المزدوج:</span>
                  <span className="text-slate-400">سماع التعليق الصوتي مع الموسيقى التصويرية معاً</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>خفت الموسيقى:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="0.6"
                      step="0.05"
                      value={musicDuckingVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setMusicDuckingVolume(val);
                        if (musicMixAudioRef.current) musicMixAudioRef.current.volume = val;
                      }}
                      className="w-16 h-1 bg-slate-700 rounded appearance-none accent-purple-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleMixPreview}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isMixPlaying
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isMixPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>إيقاف الميكس</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>تشغيل الميكس المزدوج</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
