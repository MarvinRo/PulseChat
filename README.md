Criei um arquivo .env na raiz da Pasta Backend com as seguintes variaveis:

# .env para o Backend

# --- Banco de Dados (MongoDB com Prisma) ---
 Esta é a sua string de conexão com o MongoDB.
 Se o banco estiver rodando localmente com Docker.
DATABASE_URL="mongodb://admin:password@localhost:27017/pulsechat?authSource=admin"

# --- Servidor ---
 Porta em que o servidor backend vai rodar.
PORT=3333

# --- Segurança (JSON Web Token) ---
 Chave secreta para assinar os tokens de autenticação.
 Use uma string longa e aleatória para segurança.
JWT_SECRET="SUA_CHAVE_SECRETA_SUPER_LONGA_E_ALEATORIA_AQUI"

# --- API de Inteligência Artificial ---
 Chave da API que você usa para o chatbot (ex: OpenAI, Gemini, etc.).
 Substitua pelo serviço que você integrou.
OPENAI_API_KEY="SUA_CHAVE_API_OPENAI"

# --- Serviço de E-mail (Exemplo com Nodemailer e um serviço SMTP) ---
 Configure com os dados do seu provedor de e-mail (ex: Mailtrap, SendGrid, Gmail).
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="seu_usuario@example.com"
EMAIL_PASS="sua_senha_de_app"
