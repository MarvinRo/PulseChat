import { generateResponse } from '../services/gemini.service.js';

export const perguntaAi = async (req, res) => {
    const { pergunta } = req.body;

    try {
        if (!pergunta) {
            return res.status(400).json({ error: 'Preciso que você me envie uma pergunta, para poder lhe ajudar.' });
        }

        const resposta = await generateResponse(pergunta);

        res.json({ resposta });
    } catch (error) {
        console.error('Erro ao gerar resposta:', error);
        res.status(500).json({ error: error.message || 'Erro interno no servidor da IA' });
    }
};
