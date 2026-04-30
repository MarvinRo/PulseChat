import express from 'express';
import cors from 'cors';
import aiRoutes from './src/routes/ai.routes.js';

const app = express();

const Port = 3001;

app.use(cors());

app.use(express.json());

app.use('/api', aiRoutes );

app.listen(Port,() =>{
    console.log(`Server is running on port ${Port}`);
})