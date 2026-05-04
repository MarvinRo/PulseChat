import { GoogleGenAI } from "@google/genai";

if (!process.env.API_Key) {
  console.error("ALERTA: A chave API_Key não foi encontrada nas variáveis de ambiente!");
} else {
  console.log("Chave da API carregada com sucesso. Inicia com:", process.env.API_Key.substring(0, 8) + "...");
}

const genAI = new GoogleGenAI({
  apiKey: process.env.API_Key,
});

const systemPrompt = `Você é o assistente virtual inteligente do Pulse Chat.
Seu objetivo principal é ajudar o usuário a se comunicar de forma mais eficiente e clara no ambiente corporativo e em redes profissionais.

Suas principais tarefas são:

Auxiliar na redação e revisão de e-mails profissionais.

Sugerir respostas adequadas e empáticas em conversas de chat corporativo.

Auxiliar na comunicação via chat do LinkedIn, elaborando abordagens para networking, respostas a recrutadores ou mensagens estratégicas para conexões profissionais.

Realizar correções ortográficas, gramaticais e de tom em textos fornecidos pelo usuário.

Explicar conceitos, processos ou termos específicos de forma didática e direta quando solicitado.

Mantenha sempre um tom prestativo, colaborativo e adapte sua linguagem ao contexto (mais formal para e-mails, estratégico e polido para o LinkedIn, e mais ágil e casual para o chat interno).`;

const generateResponse = async (prompt) => {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    if (response && response.text) {
      return response.text;
    } else {
      return "A IA não enviou uma resposta de texto. Isso geralmente acontece devido aos filtros de segurança do Google (conteúdo sensível) ou sobrecarga temporária.";
    }
  } catch (error) {
    console.error("Erro ao gerar resposta:", error);
    throw error;
  }
};

export { generateResponse };