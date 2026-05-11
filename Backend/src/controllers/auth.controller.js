import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from './prisma.js';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Validação básica
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
        }

        // 2. Verificar se o usuário já existe no banco
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Este e-mail já está em uso.' });
        }

        // Verifica se o nickName (mesmo do nome) já está em uso para evitar erro de unique constraint
        const existingNick = await prisma.user.findUnique({ where: { nickName: name } });
        // Se o nome já existir como nick, gera um número aleatório (ex: Marvin1234), senão usa o próprio nome
        const finalNickName = existingNick ? `${name}${Math.floor(1000 + Math.random() * 9000)}` : name;

        // 3. Criptografar a senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Salvar o usuário no Banco de Dados
        const newUser = await prisma.user.create({
            data: { name, nickName: finalNickName, email, password: hashedPassword }
        });

        // 5. Gerar o token JWT para o usuário recém-criado
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'chave_secreta_padrao',
            { expiresIn: '7d' } // Token expira em 7 dias
        );

        // 6. Retornar sucesso (enviando os dados criados e o token)
        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            user: { id: newUser.id, name: newUser.name, nickName: newUser.nickName, email: newUser.email },
            token
        });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ error: 'Erro interno no servidor ao tentar cadastrar' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'chave_secreta_padrao',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login realizado com sucesso!',
            user: { id: user.id, name: user.name, nickName: user.nickName, email: user.email },
            token
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro interno no servidor ao tentar fazer login' });
    }
};

export const updateUserProfile = async (req, res) => {
    const userId = req.user.id;
    const { nickName } = req.body;

    try {
        if (!nickName || nickName.trim() === '') {
            return res.status(400).json({ error: 'O Nickname não pode ser vazio.' });
        }

        // Verifica se o novo nickName já está em uso por OUTRO usuário
        const existingNick = await prisma.user.findFirst({
            where: {
                nickName: nickName,
                id: { not: userId }
            }
        });

        if (existingNick) {
            return res.status(409).json({ error: 'Este Nickname já está em uso por outro usuário.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { nickName: nickName.trim() },
            select: { id: true, name: true, nickName: true, email: true }
        });

        res.status(200).json({
            message: 'Perfil atualizado com sucesso!',
            user: updatedUser
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro interno no servidor ao tentar atualizar o perfil.' });
    }
};