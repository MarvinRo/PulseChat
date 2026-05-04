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

        // 3. Criptografar a senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Salvar o usuário no Banco de Dados
        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword }
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
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
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
            user: { id: user.id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro interno no servidor ao tentar fazer login' });
    }
};