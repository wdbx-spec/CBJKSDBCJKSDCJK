import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Check,
  Disc,
  Radio,
  FileAudio,
  Sparkles,
  Layers,
} from 'lucide-react';
import { GeneratedTake } from '../types';

interface AudioPlayerProps {
  take: GeneratedTake;
  onDownload?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ take }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(take.durationSeconds || 0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

  // Synchronize audio on take change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setIsDownloaded(false);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [take.id]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Audio playback error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Real, verified file download
  const handleDownloadFile = () => {
    try {
      const url = take.audioUrl || URL.createObjectURL(take.blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = take.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3500);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate file size in MB
  const approxSizeMB = (take.blob.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="bg-gradient-to-b from-[#0F172A] to-[#0A0E1A] rounded-2xl border border-amber-500/30 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={take.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Top Banner: Take Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">
                التسجيل الصوتي جاهز للمونتاج
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
                {take.filename}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              الصوت: <span className="text-slate-200">{take.settings.voice} (عميق ووثائقي)</span> • الجودة: 24kHz Mono 16-bit Master • الحجم: {approxSizeMB} ميغابايت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Playback speed buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex items-center text-xs font-mono">
            {[0.9, 1, 1.25].map(rate => (
              <button
                key={rate}
                type="button"
                onClick={() => changeSpeed(rate)}
                className={`px-2 py-1 rounded transition ${
                  playbackRate === rate
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Equalizer / Waveform Bar Display */}
      <div className="h-14 bg-[#070A10] rounded-xl border border-slate-800/80 px-4 flex items-center justify-center gap-1 sm:gap-1.5 overflow-hidden mb-5">
        {Array.from({ length: 48 }).map((_, idx) => {
          // Compute pseudo-random or progress-based height
          const isPassed = (idx / 48) <= (duration > 0 ? currentTime / duration : 0);
          const randomFactor = Math.sin(idx * 0.4) * 0.4 + 0.6;
          const dynamicHeight = isPlaying
            ? Math.max(15, Math.min(100, Math.floor(randomFactor * 85 + Math.random() * 20)))
            : Math.max(12, Math.floor(randomFactor * 60));

          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPassed
                  ? isPlaying
                    ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                    : 'bg-amber-500/80'
                  : 'bg-slate-800'
              }`}
              style={{ height: `${dynamicHeight}%` }}
            />
          );
        })}
      </div>

      {/* Timeline Seekbar and Timestamps */}
      <div className="space-y-1.5 mb-5">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all hover:bg-slate-700"
          dir="ltr"
        />
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono" dir="ltr">
          <span className="text-amber-300 font-semibold">{formatTime(currentTime)}</span>
          <span className="text-slate-500">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls: Skip, Play/Pause, Volume */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          {/* Rewind 10s */}
          <button
            type="button"
            onClick={() => handleSkip(-10)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95"
            title="تأخير 10 ثوانٍ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Main Play / Pause */}
          <button
            type="button"
            onClick={handlePlayPause}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الصوت'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current mr-0.5" />
            )}
          </button>

          {/* Forward 10s */}
          <button
            type="button"
            onClick={() => handleSkip(10)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95"
            title="تقديم 10 ثوانٍ"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Slider & Mute Toggle */}
        <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition"
            title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-300" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            dir="ltr"
            title="مستوى الصوت"
          />
        </div>
      </div>

      {/* 5. Clear, Prominent Download Button as strictly requested: "⬇ تحميل الصوت" */}
      <div className="mt-6 pt-5 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <FileAudio className="w-4 h-4 text-amber-400" />
          <span>ملف صوتي خام <strong className="text-slate-200">WAV 24kHz</strong> متوافق فوراً مع برامج المونتاج (Premiere, DaVinci, CapCut)</span>
        </div>

        <button
          type="button"
          onClick={handleDownloadFile}
          className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg ${
            isDownloaded
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]'
          }`}
          title="تحميل الملف الصوتي الناتج"
        >
          {isDownloaded ? (
            <>
              <Check className="w-5 h-5 text-white" />
              <span>تم بدء التحميل بنجاح!</span>
            </>
          ) : (
            <>
              <span className="text-lg">⬇</span>
              <span>تحميل الصوت</span>
              <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded font-mono font-medium">
                {take.filename}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
