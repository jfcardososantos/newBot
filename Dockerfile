# Usar uma imagem oficial do Node.js como base
FROM node:20

# Instalar dependências do Chromium
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  apt-transport-https \
  libx11-xcb1 \
  libxtst6 \
  libnss3 \
  libxss1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libpangocairo-1.0-0 \
  libgtk-3-0 \
  libgbm1 \
  libxshmfence1 \
  libxcomposite1 \
  libxrandr2 \
  libatk1.0-0 \
  libatspi2.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  xdg-utils \
  libappindicator3-1 \
  fonts-liberation

# Criar diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código da aplicação
COPY . .

# Instalar Chromium
RUN apt-get update && apt-get install -y chromium

# Expor a porta que a aplicação usa
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "index.js"]
