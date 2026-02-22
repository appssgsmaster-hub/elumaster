
import { GoogleGenAI } from "@google/genai";
import { ActivityType } from "../types";

export type MentorContext = 'pre_activity' | 'post_activity' | 'inactivity' | 'milestone';

interface MentorData {
  type?: ActivityType;
  steps?: number;
  distance?: number;
  time?: string;
  historyCount?: number;
}

export const getAIInsight = async (context: MentorContext, data: MentorData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `Você é o Mentor SGS, um especialista em saúde, longevidade e performance humana do SGS Group. 
  Sua missão é motivar e educar o usuário de forma acolhedora, humana e nunca punitiva. 
  Sempre termine sua mensagem com a frase exata: "SGS Group — Longevidade & Propósito"`;

  let userPrompt = "";

  switch (context) {
    case 'pre_activity':
      userPrompt = `O usuário está prestes a iniciar uma ${data.type === ActivityType.RUNNING ? 'corrida' : 'caminhada'}. 
      Dê uma dica curta e prática (máximo 120 caracteres) sobre postura, respiração ou benefício imediato para a saúde.`;
      break;
    case 'post_activity':
      userPrompt = `O usuário concluiu uma ${data.type === ActivityType.RUNNING ? 'corrida' : 'caminhada'}. 
      Dados: ${data.steps} passos, ${data.distance?.toFixed(2)} km em ${data.time}. 
      Dê um insight motivacional ou de recuperação baseado nesses números (máximo 140 caracteres).`;
      break;
    case 'inactivity':
      userPrompt = `O usuário não registra atividades há algum tempo. 
      Dê uma mensagem acolhedora convidando-o para um movimento simples, focando no bem-estar mental.`;
      break;
    default:
      userPrompt = `Dê uma dica geral de saúde e constância para o dia de hoje.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });
    return response.text || "O movimento é a chave para a longevidade. Vamos juntos? SGS Group — Longevidade & Propósito";
  } catch (error) {
    console.error("Mentor Error:", error);
    return "Cada passo conta na sua jornada de saúde. SGS Group — Longevidade & Propósito";
  }
};
