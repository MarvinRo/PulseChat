import 'dotenv/config'; // Carrega as variáveis durante a fase de importação

import express from 'express';
import cors from 'cors';
import aiRoutes from './src/routes/ai.routes.js';
import authRoutes from './src/routes/auth.routes.js';

const app = express();

const Port = 3001;

app.use(cors());

app.use(express.json());

app.use('/api', aiRoutes );
app.use('/api/auth', authRoutes); // Adiciona as rotas de autenticação

app.listen(Port,() =>{
    console.log(`Server is running on port ${Port}`);
})