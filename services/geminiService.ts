import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { getSystemInstruction, UNKNOWN_INFO_RESPONSE } from '../constants';

/**
 * Sends a message to the Gemini API with the พี่สมเด็จ persona and BCU knowledge base.
 * @param userMessage The message from the user.
 * @returns A promise that resolves to the AI's response string.
 * @throws Error if API key is not configured or if there's an API error.
 */
export const sendGeminiMessage = async (userMessage: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured. Please ensure your environment variable API_KEY is set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = getSystemInstruction();

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using gemini-3-flash-preview for general text tasks
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Adjust temperature for desired creativity/consistency
        topP: 0.95,
        topK: 64,
      },
    });

    const aiResponse = response.text;
    if (!aiResponse) {
      console.warn("Gemini API returned an empty response.");
      return UNKNOWN_INFO_RESPONSE; // Fallback for empty response
    }

    return aiResponse;
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    // You might implement more sophisticated error parsing here if needed
    // For now, check for specific messages from the API for better user feedback
    if (error instanceof Error && error.message.includes("API Key not valid")) {
        throw new Error("เกิดข้อผิดพลาด: API Key ไม่ถูกต้อง โปรดตรวจสอบการตั้งค่าครับผม");
    }
    throw new Error(`เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ: ${error instanceof Error ? error.message : String(error)} โปรดลองใหม่อีกครั้งครับผม`);
  }
};
