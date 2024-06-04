# Usar uma imagem oficial do Node.js como base
FROM node:20

# Criar diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código da aplicação
COPY . .

# Expor a porta que a aplicação usa
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "index.js"]
