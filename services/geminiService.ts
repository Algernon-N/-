
import { GoogleGenAI, Type } from "@google/genai";

// Standardizing Gemini API service implementation
export const generateChristmasWish = async (mood: string = 'warm green and gold cyber-christmas'): Promise<string> => {
  try {
    // Initialize GoogleGenAI right before the call as per best practices
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, elegant Christmas wish with a "Warm Cyber-Christmas" vibe. Theme: Evergreen, Gold, and Ruby Red. Keep it under 20 words. Use emojis sparingly.`,
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });
    
    // Accessing text as a property, not a method call
    return response.text?.trim() || "Merry Cyber Christmas! May your holiday be filled with golden light and evergreen joy.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Under the emerald boughs and golden stars, may your digital heart find peace. Merry Christmas.";
  }
};
