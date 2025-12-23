
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartSuggestions = async (userPrompt: string) => {
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
