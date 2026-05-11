// Inicializa o banco de dados MongoDB
db = db.getSiblingDB('pulse_app');

// Opcional: Criar um usuário de aplicação específico para o MongoDB
db.createUser({
  user: "pulse_app_user",
  pwd: "pulse_app_password",
  roles: [{ role: "readWrite", db: "pulse_app" }]
});

// Inicializa o Replica Set (necessário para o Prisma Client usar transações)
try {
  rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "localhost:27017" }]
  });
} catch (err) {
  print("Replica Set já inicializado ou ocorreu um erro: " + err);
}