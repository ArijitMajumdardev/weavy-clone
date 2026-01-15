import { GoogleGenerativeAI } from '@google/generative-ai';


export const getGeminiClient = () => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const GEMINI_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', multimodal: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', multimodal: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', multimodal: true },
] as const;
