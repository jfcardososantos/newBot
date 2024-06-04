const venom = require('venom-bot');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

function loadBusinessInfo() {
  const filePath = path.join(__dirname, 'business_info.txt');
  return fs.readFileSync(filePath, 'utf8');
}

const businessInfo = loadBusinessInfo();

function isValidResponse(response, businessInfo) {
  return businessInfo.toLowerCase().includes(response.toLowerCase());
}

function formatResponse(response) {
  return `Aqui está a informação que encontrei: ${response}`;
}

venom
  .create({
    session: 'venom-bot', 
    multidevice: true, 
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--headless',
      '--disable-software-rasterizer'
    ],
    headless: "new", 
    executablePath: '/usr/bin/chromium-browser', 
    logQR: true, 
    qrTimeout: 0, 
    qrLogSkip: false, 
    autoClose: 0, 
    disableSpins: true, 
  })
  .then(client => start(client))
  .catch(error => {
    console.error('Erro ao criar o cliente:', error);
  });

async function getChatGPTResponse(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const response = await axios.post(
    'https://api.openai.com/v1/completions',
    {
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].text.trim();
}

// Função para obter o status do usuário
async function getUserStatus(client) {
  const status = await client.getStatus();
  return status.status;
}

async function start(client) {
  client.onMessage(async message => {
    if (message.isGroupMsg === false) {
      const userStatus = await getUserStatus(client);
      if (userStatus.toLowerCase() === 'autoatendimento') {
        const userPrompt = `Informações do negócio:\n${businessInfo}\n\nPergunta do cliente: ${message.body}\n\nResposta:`;
        const chatGPTResponse = await getChatGPTResponse(userPrompt);
        
        if (isValidResponse(chatGPTResponse, businessInfo)) {
          const formattedResponse = formatResponse(chatGPTResponse);
          client
            .sendText(message.from, formattedResponse)
            .then(result => {
              console.log('Result: ', result); // Mensagem enviada com sucesso
            })
            .catch(error => {
              console.error('Erro ao enviar mensagem: ', error); // Erro ao enviar a mensagem
            });
        } else {
          const defaultMessage = 'Desculpe, não encontrei a informação solicitada em nossa base de dados.';
          client
            .sendText(message.from, defaultMessage)
            .then(result => {
              console.log('Result: ', result); 
            })
            .catch(error => {
              console.error('Erro ao enviar mensagem: ', error); 
            });
        }
      } else {
        console.log('Status não é "Autoatendimento". Nenhuma resposta será enviada.');
      }
    }
  });
}
