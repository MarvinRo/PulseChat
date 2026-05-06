import express from 'express';
import http from 'http'; 
import { Server } from 'socket.io'; 
import cors from 'cors';
import chatRoutes from './src/routes/chat.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import aiRoutes from './src/routes/ai.routes.js';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId);
    }
});

app.use(cors());
app.use(express.json());

app.use('/api', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', chatRoutes);


server.listen(3001, () => {
    console.log('🚀 Servidor rodando na porta 3001 com Socket.IO ativado!');
});
