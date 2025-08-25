FROM node:18-alpine

WORKDIR /app

# Copiar solo los archivos del servidor
COPY server/package*.json ./server/
COPY server/ ./server/

# Instalar dependencias del servidor
WORKDIR /app/server
RUN npm install --production

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["npm", "start"]
