import { useState, useEffect } from 'react';
import localforage from 'localforage';
import { GoogleGenAI } from '@google/genai';

const TEACHERS = [
  {
    id: 'Yoqubjon O‘rinov',
    prompt: 'A highly professional, warm, and approachable head-and-shoulders portrait of a German language teacher, suitable for an expert-led educational center website. Male, approximately 35-40 years old, confident, authoritative yet friendly look. Uzbek ethnicity. Wearing a professional, modern business outfit (blazer and shirt). Sharp, crisp, high-resolution portrait, suitable for circular framing. Setting: brightly lit, modern German language classroom with soft, natural daylight. Background softly blurred (shallow depth of field), showing subtle hints of bookshelves, German flags, chalkboards with artistic yet unreadable German text. Lighting: soft, even, flattering. Color palette: clean, sophisticated, deep blues, warm wooden tones, crisp whites. Premium corporate portrait style.'
  },
  {
    id: 'Foziljon Maxamadaliyev',
    prompt: 'A highly professional, warm, and approachable head-and-shoulders portrait of a German language teacher, suitable for an expert-led educational center website. Male, approximately 40-45 years old, distinguished, knowledgeable, subtle smile. Uzbek ethnicity. Wearing a professional, modern business outfit (blazer and shirt). Sharp, crisp, high-resolution portrait, suitable for circular framing. Setting: brightly lit, modern German language classroom with soft, natural daylight. Background softly blurred (shallow depth of field), showing subtle hints of bookshelves, German flags, chalkboards with artistic yet unreadable German text. Lighting: soft, even, flattering. Color palette: clean, sophisticated, deep blues, warm wooden tones, crisp whites. Premium corporate portrait style.'
  },
  {
    id: 'Botir Qudratov',
    prompt: 'A highly professional, warm, and approachable head-and-shoulders portrait of a German language teacher, suitable for an expert-led educational center website. Male, approximately 30-35 years old, modern, energetic, focused gaze. Uzbek ethnicity. Wearing a professional, modern business outfit (blazer and shirt). Sharp, crisp, high-resolution portrait, suitable for circular framing. Setting: brightly lit, modern German language classroom with soft, natural daylight. Background softly blurred (shallow depth of field), showing subtle hints of bookshelves, German flags, chalkboards with artistic yet unreadable German text. Lighting: soft, even, flattering. Color palette: clean, sophisticated, deep blues, warm wooden tones, crisp whites. Premium corporate portrait style.'
  },
  {
    id: 'Umar Jovliyev',
    prompt: 'A highly professional, warm, and approachable head-and-shoulders portrait of a German language teacher, suitable for an expert-led educational center website. Male, approximately 25-30 years old, young, enthusiastic, approachable. Uzbek ethnicity. Wearing a professional, modern business outfit (blazer and shirt). Sharp, crisp, high-resolution portrait, suitable for circular framing. Setting: brightly lit, modern German language classroom with soft, natural daylight. Background softly blurred (shallow depth of field), showing subtle hints of bookshelves, German flags, chalkboards with artistic yet unreadable German text. Lighting: soft, even, flattering. Color palette: clean, sophisticated, deep blues, warm wooden tones, crisp whites. Premium corporate portrait style.'
  },
  {
    id: 'Muhayyo Egamberganova',
    prompt: 'A highly professional, warm, and approachable head-and-shoulders portrait of a German language teacher, suitable for an expert-led educational center website. Female, approximately 30-35 years old, confident, welcoming, natural smile. Uzbek ethnicity. Wearing a professional, modern business outfit (blouse and jacket). Sharp, crisp, high-resolution portrait, suitable for circular framing. Setting: brightly lit, modern German language classroom with soft, natural daylight. Background softly blurred (shallow depth of field), showing subtle hints of bookshelves, German flags, chalkboards with artistic yet unreadable German text. Lighting: soft, even, flattering. Color palette: clean, sophisticated, deep blues, warm wooden tones, crisp whites. Premium corporate portrait style.'
  },
  {
    id: 'Xonzodabegim Dadamatova',
    prompt: 'A highly professional, warm, and approachable head-and-shoulders portrait of a German language teacher, suitable for an expert-led educational center website. Female, approximately 25-30 years old, bright, friendly, supportive gaze. Uzbek ethnicity. Wearing a professional, modern business outfit (blouse and jacket). Sharp, crisp, high-resolution portrait, suitable for circular framing. Setting: brightly lit, modern German language classroom with soft, natural daylight. Background softly blurred (shallow depth of field), showing subtle hints of bookshelves, German flags, chalkboards with artistic yet unreadable German text. Lighting: soft, even, flattering. Color palette: clean, sophisticated, deep blues, warm wooden tones, crisp whites. Premium corporate portrait style.'
  },
  {
    id: 'Dildora Fayzullayeva',
    prompt: 'A highly professional, warm, and approachable head-and-shoulders portrait of a German language teacher, suitable for an expert-led educational center website. Female, approximately 40-45 years old, experienced, nurturing, encouraging smile. Uzbek ethnicity. Wearing a professional, modern business outfit (blouse and jacket). Sharp, crisp, high-resolution portrait, suitable for circular framing. Setting: brightly lit, modern German language classroom with soft, natural daylight. Background softly blurred (shallow depth of field), showing subtle hints of bookshelves, German flags, chalkboards with artistic yet unreadable German text. Lighting: soft, even, flattering. Color palette: clean, sophisticated, deep blues, warm wooden tones, crisp whites. Premium corporate portrait style.'
  }
];

export const useTeacherPortraits = () => {
  const [portraits, setPortraits] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortraits = async () => {
      const loaded: Record<string, string> = {};
      for (const teacher of TEACHERS) {
        const data = await localforage.getItem<string>(`teacher_img_${teacher.id}`);
        if (data) {
          loaded[teacher.id] = data;
        }
      }
      setPortraits(loaded);
    };
    loadPortraits();
  }, []);

  const generatePortraits = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      // @ts-ignore
      if (!await window.aistudio.hasSelectedApiKey()) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // @ts-ignore
        if (!await window.aistudio.hasSelectedApiKey()) {
          throw new Error("API key is required to generate images.");
        }
      }

      let apiKey = '';
      try {
        apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      } catch (e) {
        // Fallback for Vite if process is not defined
        apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      }
      
      if (!apiKey) {
        throw new Error("API key not found in environment.");
      }

      const ai = new GoogleGenAI({ apiKey });

      const newPortraits: Record<string, string> = { ...portraits };

      for (let i = 0; i < TEACHERS.length; i++) {
        const teacher = TEACHERS[i];
        
        // Skip if already generated
        if (newPortraits[teacher.id]) {
          setProgress(((i + 1) / TEACHERS.length) * 100);
          continue;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: teacher.prompt,
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K"
            }
          }
        });

        let base64Data = null;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }

        if (base64Data) {
          const dataUrl = `data:image/jpeg;base64,${base64Data}`;
          await localforage.setItem(`teacher_img_${teacher.id}`, dataUrl);
          newPortraits[teacher.id] = dataUrl;
          setPortraits({ ...newPortraits });
        }
        
        setProgress(((i + 1) / TEACHERS.length) * 100);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while generating images.");
    } finally {
      setIsGenerating(false);
    }
  };

  return { portraits, generatePortraits, isGenerating, progress, error };
};
