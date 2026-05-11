import prisma from './prisma.js';

// 1. Busca todos os usuários cadastrados (lista de contatos)
export const getContacts = async (req, res) => {
    try {
        // Assumindo que seu middleware de autenticação (JWT) injeta o ID do usuário em req.user
        const currentUserId = req.user.id;        
        const { search } = req.query; // Captura a busca da URL (ex: ?search=ma)
        
        // Condição base: excluir o próprio usuário logado da lista
        const whereCondition = {
            id: { not: currentUserId }
        };

        // Se houver um termo pesquisado, adiciona a regra de aproximação
        if (search) {
            whereCondition.OR = [
                { name: { startsWith: search } },
                { email: { startsWith: search } },
                { nickName: { startsWith: search } }
            ];
        }

        const contacts = await prisma.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                name: true,
                nickName: true,
                email: true
            }
        });

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ error: 'Erro interno ao buscar contatos' });
    }
};

// 2. Envia uma mensagem para um contato específico
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Destinatário e conteúdo são obrigatórios' });
        }

        // 1. Verifica se já existe um chat ativo entre os dois usuários
        let chat = await prisma.chat.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: senderId } } },
                    { participants: { some: { id: receiverId } } }
                ]
            },
            include: {
                participants: {
                    select: { id: true }
                }
            }
        });

        // 2. Se não existir, cria a "sala de chat" conectando os dois
        if (!chat) {
            chat = await prisma.chat.create({
                data: {
                    participants: {
                        connect: [{ id: senderId }, { id: receiverId }]
                    }
                },
                include: {
                    participants: {
                        select: { id: true }
                    }
                }
            });
        }

        // 3. Cria a mensagem vinculada ao chat
        const message = await prisma.message.create({
            data: {
                senderId,
                chatId: chat.id,
                content
            }
        });

        // 4. Atualiza a data do chat para ele subir na lista de contatos
        await prisma.chat.update({
            where: { id: chat.id },
            data: { updatedAt: new Date() }
        });

        // 5. Emite a mensagem em tempo real para o destinatário usando Socket.IO
        const io = req.app.get('io');
        if (io && chat.participants) {
            chat.participants.forEach(participant => {
                io.to(participant.id.toString()).emit('newMessage', message);
            });
        } else {
            console.log("⚠️ AVISO: O objeto 'io' não foi encontrado no Express. O tempo real não vai funcionar!");
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro interno ao enviar mensagem' });
    }
};

// 3. Busca o histórico de mensagens entre você e um contato
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { contactId } = req.params;

        const chat = await prisma.chat.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: contactId } } }
                ]
            },
            include: {
                messages: { 
                    where: {
                        NOT: { deletedBy: { has: userId } }
                    },
                    orderBy: { createdAt: 'asc' } 
                }
            }
        });

        res.status(200).json(chat ? { messages: chat.messages, chatId: chat.id } : { messages: [], chatId: null });
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ error: 'Erro histórico' });
    }
};

// 4. Busca as conversas ativas do usuário
export const getActiveChats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Busca todos os chats em que o usuário logado é participante
        const activeChats = await prisma.chat.findMany({
            where: {
                participants: { some: { id: userId } },
                messages: {
                    some: {
                        NOT: { deletedBy: { has: userId } }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }, // Traz as conversas recentes primeiro
            include: {
                participants: {
                    where: { id: { not: userId } }, // Pega apenas a OUTRA pessoa
                    select: { id: true, name: true, nickName: true, email: true }
                }
            }
        });

        // Formata para o React continuar recebendo apenas a lista de contatos
        const activeContacts = activeChats
            .filter(chat => chat.participants.length > 0)
            .map(chat => chat.participants[0]);

        res.status(200).json(activeContacts);
    } catch (error) {
        console.error('Erro ao buscar conversas ativas:', error);
        res.status(500).json({ error: 'Erro interno ao buscar conversas ativas' });
    }
};

// 5. Exclui a conversa e todo o histórico de mensagens
export const deleteChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { contactId } = req.params;

        // Busca o chat que possui os dois participantes
        const chat = await prisma.chat.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: contactId } } }
                ]
            },
            include: {
                messages: true,
                participants: true
            }
        });

        if (!chat) {
            return res.status(404).json({ error: 'Conversa não encontrada' });
        }

        // 1. Marca todas as mensagens atuais como deletadas por este usuário
        const updatePromises = chat.messages.map(async (msg) => {
            const currentDeletedBy = msg.deletedBy || [];
            
            // Se o usuário ainda não deletou essa mensagem
            if (!currentDeletedBy.includes(userId)) {
                const newDeletedBy = [...currentDeletedBy, userId];
                
                // Se todos os participantes do chat deletaram a mensagem, apagamos ela definitivamente
                if (newDeletedBy.length >= chat.participants.length) {
                    return prisma.message.delete({ where: { id: msg.id } });
                } else {
                    // Senão, apenas adicionamos o usuário na lista de "quem deletou"
                    return prisma.message.update({
                        where: { id: msg.id },
                        data: { deletedBy: newDeletedBy }
                    });
                }
            }
        });

        await Promise.all(updatePromises);

        // 2. Verifica se ainda sobrou alguma mensagem no chat
        const remainingMessages = await prisma.message.count({
            where: { chatId: chat.id }
        });

        // 3. Se não houver mais nenhuma mensagem visível no chat (ambos apagaram tudo), apagamos a sala
        if (remainingMessages === 0) {
            await prisma.chat.delete({ where: { id: chat.id } });
        }

        res.status(200).json({ message: 'Conversa excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir conversa:', error);
        res.status(500).json({ error: 'Erro interno ao excluir conversa' });
    }
};