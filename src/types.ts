export interface VoiceSettings {
  voice: 'Charon' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Kore';
  speed: 'slow' | 'normal' | 'fast';
  expression: 'balanced' | 'high_suspense' | 'investigative';
  format: 'wav' | 'mp3';
}

export interface GeneratedTake {
  id: string;
  takeNumber: number;
  filename: string;
  audioBase64: string;
  audioUrl: string;
  blob: Blob;
  durationSeconds: number;
  wordCount: number;
  textSnippet: string;
  fullText: string;
  createdAt: Date;
  settings: VoiceSettings;
}

export interface GeneratedMusic {
  id: string;
  title: string;
  prompt: string;
  audioBase64: string;
  audioUrl: string;
  blob: Blob;
  filename: string;
  model: string;
  createdAt: Date;
}
