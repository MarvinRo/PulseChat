FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gera o Prisma Client compatível com o Linux do container antes de iniciar
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "run", "start:docker"]