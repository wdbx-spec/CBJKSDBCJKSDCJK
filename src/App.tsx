/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ScriptInput } from './components/ScriptInput';
import { AudioPlayer } from './components/AudioPlayer';
import { SettingsModal } from './components/SettingsModal';
import { TakesHistory } from './components/TakesHistory';
import { SoundtrackStudio } from './components/SoundtrackStudio';
import { VoiceSettings, GeneratedTake } from './types';
import { DEFAULT_VOICE_SETTINGS, SAMPLE_SCRIPTS } from './constants/presets';
import { AlertTriangle, Sparkles, Film, Mic, Headphones } from 'lucide-react';

export default function App() {
  // Video Script state - preloaded with a sample financial documentary script
  const [text, setText] = useState<string>(SAMPLE_SCRIPTS[0].text);

  // Channel Voice settings - defaults strictly to «وراء المال» specifications
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Take & Session Takes History
  const [currentTake, setCurrentTake] = useState<GeneratedTake | null>(null);
  const [takesHistory, setTakesHistory] = useState<GeneratedTake[]>([]);
  const [takeCount, setTakeCount] = useState<number>(0);

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showSoundtrack, setShowSoundtrack] = useState<boolean>(false);

  /**
   * Main Voiceover Generation Execution
   */
  const handleGenerateVoiceover = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    const nextTakeNumber = takeCount + 1;

    try {
      const response = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: settings.voice,
          speed: settings.speed,
          expression: settings.expression,
          format: settings.format,
          takeNumber: nextTakeNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ غير متوقع أثناء توليد التعليق الصوتي.');
      }

      // Convert Base64 WAV to Blob and Object URL
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      // Determine proper filename based on user specifications:
      // waraa_almal_voiceover.wav for take 1, then waraa_almal_voiceover_01.wav, 02, etc.
      let filename = 'waraa_almal_voiceover.wav';
      if (nextTakeNumber > 1) {
        const padded = String(nextTakeNumber - 1).padStart(2, '0');
        filename = `waraa_almal_voiceover_${padded}.wav`;
      }
      if (settings.format === 'mp3') {
        filename = filename.replace('.wav', '.mp3');
      }

      const newTake: GeneratedTake = {
        id: `take-${Date.now()}`,
        takeNumber: nextTakeNumber,
        filename,
        audioBase64: data.audioBase64,
        audioUrl,
        blob,
        durationSeconds: data.durationSeconds || 0,
        wordCount: data.wordCount || 0,
        textSnippet: text.trim().slice(0, 100) + '...',
        fullText: text.trim(),
        createdAt: new Date(),
        settings: { ...settings },
      };

      setTakeCount(nextTakeNumber);
      setCurrentTake(newTake);
      setTakesHistory((prev) => [newTake, ...prev]);

      // Scroll smoothly down to the player if needed
      setTimeout(() => {
        const playerElem = document.getElementById('player-section');
        if (playerElem) {
          playerElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    } catch (err: any) {
      console.error('Voiceover generation failed:', err);
      setErrorMessage(
        err.message || 'تعذر توليد الصوت. يرجى التحقق من الاتصال والمحاولة مجدداً.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-[#E2E8F0] flex flex-col font-['Cairo',sans-serif]">
      {/* Top Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSoundtrack={() => setShowSoundtrack((prev) => !prev)}
        showSoundtrack={showSoundtrack}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex items-start gap-3 text-sm animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold block mb-0.5">خطأ في التوليد</strong>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-white px-2 py-1 rounded hover:bg-rose-900/40"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* 1. Main Script Box and Action Button */}
        <ScriptInput
          text={text}
          onChange={setText}
          onGenerate={handleGenerateVoiceover}
          isGenerating={isGenerating}
        />

        {/* 4 & 5. Audio Player & Download Section (Shown after generation) */}
        {currentTake && (
          <section id="player-section" className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider px-1">
              <Headphones className="w-4 h-4" />
              <span>مشغل المونتاج والتنزيل الفوري</span>
            </div>
            <AudioPlayer take={currentTake} />
          </section>
        )}

        {/* Feature: Lyria Music Generation Studio */}
        {showSoundtrack && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300">
            <SoundtrackStudio
              currentTake={currentTake}
              onClose={() => setShowSoundtrack(false)}
            />
          </section>
        )}

        {/* Session Takes Archive */}
        <TakesHistory
          takes={takesHistory}
          activeTakeId={currentTake?.id || null}
          onSelectTake={(take) => setCurrentTake(take)}
          onClearHistory={() => {
            if (confirm('هل ترغب في مسح سجل التسجيلات المؤقت لهذه الجلسة؟')) {
              setTakesHistory([]);
            }
          }}
        />

        {/* Footer Identity Guidelines & Channel Info */}
        <footer className="pt-8 pb-12 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-500" />
              مخصص لقناة «وراء المال»
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              معيار السرد: 125–140 كلمة/دقيقة
            </span>
            <span>•</span>
            <span>صيغة الماستر: WAV 24kHz Uncompressed</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Consistency &gt; Naturalness &gt; Storytelling &gt; Clarity — جميع الحقوق محفوظة لقناة «وراء المال»
          </p>
        </footer>
      </main>

      {/* Advanced Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </div>
  );
}
