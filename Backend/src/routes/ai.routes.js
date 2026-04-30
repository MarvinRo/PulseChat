import express from 'express';
import { perguntaAi } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/perguntaAi', perguntaAi);

export default router;