import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Ensure server-side Gemini client with required User-Agent
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ Warning: GEMINI_API_KEY environment variable is not set. Gemini API calls will fail until configured.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Helper to split long text into natural paragraphs/sentences
 * for seamless documentary narration without truncation.
 */
function splitScriptIntoChunks(text: string, maxChunkLength = 900): string[] {
  const paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    if (para.length > maxChunkLength) {
      // Split large paragraph by sentence punctuation (. ! ؟ ? :)
      const sentences = para.split(/([.!؟?:؛]+)/);
      for (let i = 0; i < sentences.length; i += 2) {
        const sentence = (sentences[i] || '') + (sentences[i + 1] || '');
        if (!sentence.trim()) continue;

        if (currentChunk && (currentChunk.length + sentence.length) > maxChunkLength) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }
    } else {
      if (currentChunk && (currentChunk.length + para.length) > maxChunkLength) {
        chunks.push(currentChunk.trim());
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Build a 44-byte standard RIFF WAV header for 24kHz, 16-bit, mono PCM.
 */
function createWavHeader(dataLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  header.write('RIFF', 0);
  header.writeUInt32LE(dataLength + 36, 4); // File size - 8
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  header.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

/**
 * Extract raw PCM data from a standard 44-byte WAV buffer
 */
function extractPcmFromWav(wavBuffer: Buffer): Buffer {
  if (wavBuffer.length <= 44) return Buffer.alloc(0);
  // Check if starts with RIFF
  const riff = wavBuffer.subarray(0, 4).toString('ascii');
  if (riff === 'RIFF') {
    // Find 'data' chunk
    let offset = 12;
    while (offset < wavBuffer.length - 8) {
      const chunkId = wavBuffer.subarray(offset, offset + 4).toString('ascii');
      const chunkSize = wavBuffer.readUInt32LE(offset + 4);
      if (chunkId === 'data') {
        return wavBuffer.subarray(offset + 8, offset + 8 + chunkSize);
      }
      offset += 8 + chunkSize;
    }
    // Fallback: standard 44-byte header
    return wavBuffer.subarray(44);
  }
  // If not RIFF, assume raw PCM
  return wavBuffer;
}

// -------------------------------------------------------------
// POST /api/generate-voiceover: Core TTS Engine for «وراء المال»
// -------------------------------------------------------------
app.post('/api/generate-voiceover', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      voice = 'Charon',
      speed = 'normal',
      expression = 'balanced',
      format = 'wav',
      takeNumber = 1,
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'يرجى تقديم نص الفيديو المراد توليد الصوت له.' });
      return;
    }

    const cleanText = text.trim();
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

    // Build specialized style prompt for «وراء المال» YouTube documentary narrator
    let styleDescriptor =
      'وثائقي سينمائي احترافي لقناة «وراء المال»، صوت رجل عربي بالغ، عميق، واثق، هادئ وغامض قليلاً، يحكي أسرار الثروة والاحتيال وصعود وسقوط الشركات الكبرى، إلقاء سردي حقيقي ومؤثر، وقفات طبيعية، نبرة متدرجة من التشويق في البداية إلى الهدوء والتأثير في الخاتمة.';

    if (expression === 'high_suspense') {
      styleDescriptor += ' مع نبرة غموض وتشويق مكثفة، وتوتر ملحوظ عند الصدمات والمفاجآت الاقتصادية.';
    } else if (expression === 'investigative') {
      styleDescriptor += ' مع طابع تحقيق استقصائي صحفي رصين وهادئ يركز على الحقائق والأرقام.';
    }

    if (speed === 'slow') {
      styleDescriptor += ' إيقاع هادئ وبطيء (حوالي 120 كلمة بالدقيقة) مع وضوح فائق للأرقام والأسماء.';
    } else if (speed === 'fast') {
      styleDescriptor += ' إيقاع متسارع وحيوي نسبياً (حوالي 145 كلمة بالدقيقة) مع الحفاظ على الفخامة.';
    } else {
      styleDescriptor += ' إيقاع معتدل متوازن (125-140 كلمة بالدقيقة).';
    }

    // Split text if it's long to ensure complete narration without cuts
    const chunks = splitScriptIntoChunks(cleanText, 1000);
    const audioBuffers: Buffer[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: chunkText,
                speechMetadata: {
                  speaker: 'Narrator',
                  style: styleDescriptor,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error(`فشل استلام البيانات الصوتية من نموذج TTS للمقطع ${i + 1}`);
      }

      const chunkBuffer = Buffer.from(base64Audio, 'base64');
      audioBuffers.push(chunkBuffer);
    }

    let finalWavBuffer: Buffer;

    if (audioBuffers.length === 1) {
      finalWavBuffer = audioBuffers[0];
    } else {
      // Concatenate raw PCM from each unary chunk
      const pcmList = audioBuffers.map(extractPcmFromWav);
      const combinedPcm = Buffer.concat(pcmList);
      const header = createWavHeader(combinedPcm.length, 24000, 1, 16);
      finalWavBuffer = Buffer.concat([header, combinedPcm]);
    }

    // Calculate duration (24000 Hz, 16 bit mono = 48,000 bytes/sec)
    const pcmLength = Math.max(0, finalWavBuffer.length - 44);
    const durationSeconds = Number((pcmLength / 48000).toFixed(2));

    // Naming rule:
    // waraa_almal_voiceover.wav for take 1, waraa_almal_voiceover_01.wav, waraa_almal_voiceover_02.wav, etc.
    let filename = 'waraa_almal_voiceover.wav';
    if (takeNumber > 1) {
      const padded = String(takeNumber - 1).padStart(2, '0');
      filename = `waraa_almal_voiceover_${padded}.wav`;
    }

    if (format === 'mp3') {
      filename = filename.replace('.wav', '.mp3');
    }

    res.json({
      success: true,
      audioBase64: finalWavBuffer.toString('base64'),
      mimeType: 'audio/wav',
      durationSeconds,
      wordCount,
      filename,
      voice,
      chunksCount: chunks.length,
    });
  } catch (error: any) {
    console.error('Error generating voiceover:', error);
    res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء توليد التعليق الصوتي. يرجى المحاولة مرة أخرى.',
    });
  }
});

// -------------------------------------------------------------
// POST /api/generate-music: Lyria Music Generation Feature
// -------------------------------------------------------------
app.post('/api/generate-music', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      prompt,
      model = 'lyria-3-clip-preview', // or 'lyria-3-pro-preview'
      preset = 'financial_mystery',
    } = req.body;

    let finalPrompt = prompt;
    if (!finalPrompt || typeof finalPrompt !== 'string' || !finalPrompt.trim()) {
      if (preset === 'financial_mystery') {
        finalPrompt = 'Dark cinematic suspenseful documentary soundtrack with low cello, pulsating synths, subtle ticking clocks, and deep tension for a financial crime investigation.';
      } else if (preset === 'market_crash') {
        finalPrompt = 'High tension cinematic orchestral score with ominous strings, heavy dramatic brass and accelerating heartbeat rhythm depicting a massive stock market collapse.';
      } else if (preset === 'empire_rise') {
        finalPrompt = 'Majestic, brooding corporate cinematic documentary music with deep electronic sub-bass, inspiring piano arpeggio and intriguing narrative mystery.';
      } else {
        finalPrompt = 'Cinematic investigative documentary background music, subtle, dark, atmospheric and non-distracting for YouTube voiceover.';
      }
    }

    const selectedModel = model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: finalPrompt,
    });

    let audioBase64 = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
      }
    }

    if (!audioBase64) {
      throw new Error('لم يتم استلام أي مقطع صوتي للموسيقى.');
    }

    res.json({
      success: true,
      audioBase64,
      mimeType,
      prompt: finalPrompt,
      model: selectedModel,
      filename: `waraa_almal_soundtrack_${Date.now()}.wav`,
    });
  } catch (error: any) {
    console.error('Error generating music:', error);
    res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء توليد الموسيقى التصويرية.',
    });
  }
});

// Vite & Static file serving
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🎬 «وراء المال» Server running on port ${PORT}`);
});
