
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI(apiKey) : null;

export const getSmartSuggestions = async (userPrompt: string) => {
  if (!ai) {
    console.warn("Gemini AI not initialized (missing API Key)");
    return ["Cabelo", "Barba", "Manicure"];
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O usuário está procurando por serviços de agendamento: "${userPrompt}". 
      Baseado nisso, sugira 3 categorias de serviços ou termos de busca que seriam úteis. 
      Retorne apenas um array JSON de strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return [];
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return ["Cabelo", "Barba", "Manicure"];
  }
};

export const getSmartSummary = async (appointmentDetails: string) => {
  if (!ai) return "Seu agendamento está confirmado!";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Resuma este agendamento para um lembrete rápido e amigável: ${appointmentDetails}. 
      Seja curto e direto. Máximo 15 palavras.`,
    });
    return response.text?.trim() || "Lembrete de agendamento MarcAI.";
  } catch (error) {
    return "Seu agendamento está confirmado!";
  }
};
