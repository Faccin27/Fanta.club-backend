const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const cert = fs.readFileSync(
  path.resolve(__dirname, `../../certs/${process.env.GN_CERT}`)
);

const agent = new https.Agent({
  pfx: cert,
  passphrase: ''
});

const authenticate = ({ clientID, clientSecret }) => {
  const credentials = Buffer.from(
    `${clientID}:${clientSecret}`
  ).toString('base64');

  return axios({
    method: 'POST',
    url: `${process.env.GN_ENDPOINT}/oauth/token`,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    httpsAgent: agent,
    data: {
      grant_type: 'client_credentials'
    }
  });
};

let tokenData = {
  accessToken: null,
  expiresAt: null
};

const isTokenExpired = () => {
  if (!tokenData.accessToken || !tokenData.expiresAt) return true;
  //  5 minutos p segurança
  return Date.now() >= tokenData.expiresAt - 5 * 60 * 1000;
};

const GNRequest = async (credentials) => {
  const instance = axios.create({
    baseURL: process.env.GN_ENDPOINT,
    httpsAgent: agent,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // "middleware" para verificar e renovar o token a cada requisição
  instance.interceptors.request.use(async (config) => {
    if (isTokenExpired()) {
      try {
        const authResponse = await authenticate(credentials);
        tokenData = {
          accessToken: authResponse.data.access_token,
          // Define expiração para 1 hora menos 5 minutos de margem
          expiresAt: Date.now() + (authResponse.data.expires_in * 1000)
        };
      } catch (error) {
        console.error('Erro ao renovar token:', error.message);
        throw error;
      }
    }

    config.headers.Authorization = `Bearer ${tokenData.accessToken}`;
    return config;
  });

  // 'middleware' para tratar erros de token expirado
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Se receber erro de token inválido e não for uma retry
      if (error.response?.status === 401 && 
          error.response?.data?.error === 'invalid_token' && 
          !originalRequest._retry) {
        
        originalRequest._retry = true;
        
        try {
          // Força renovação do token
          tokenData = { accessToken: null, expiresAt: null };
          const authResponse = await authenticate(credentials);
          tokenData = {
            accessToken: authResponse.data.access_token,
            expiresAt: Date.now() + (authResponse.data.expires_in * 1000)
          };
          
          // Atualiza o token e tenta novamente
          originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
          return instance(originalRequest)
        } catch (error) {
          console.error('Erro ao renovar token após 401:', error.message);
          throw error;
        }
      }
      
      throw error;
    }
  );

  return instance;
};

module.exports = GNRequest;