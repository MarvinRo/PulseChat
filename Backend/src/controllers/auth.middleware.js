import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Pega o token do formato "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta_padrao');
        req.user = verified; // Injeta os dados do usuário (incluindo o ID) na requisição
        next(); // Tudo certo, pode seguir para o controller!
    } catch (error) {
        res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
};