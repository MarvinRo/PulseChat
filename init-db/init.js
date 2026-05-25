// Inicializa o banco de dados MongoDB
db = db.getSiblingDB('pulse_app');

// Inicializa o Replica Set (necessário para o Prisma Client usar transações)
try {
  rs.initiate({
    _id: "rs0",
    // Usamos o nome do container para que outros containers na rede Docker possam encontrá-lo
    members: [{ _id: 0, host: "pulse_mongodb:27017" }]
  });
  print("✅ Replica Set inicializado com sucesso.");
} catch (err) {
  // O erro 'AlreadyInitialized' é esperado em reinicializações, os outros não.
  if (err.codeName !== 'AlreadyInitialized') {
    printjson(err);
  } else {
    print("✅ Replica Set já estava inicializado.");
  }
}