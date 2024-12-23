// src/routes/paymentRouter.js
const GNRequest = require('../api/gerencianet');

const pendingPayments = new Map(); // [SIMULAÇÃO] Armazenamento em memória para pagamentos pendentes

const reqGNAlready = GNRequest({
  clientID: process.env.GN_CLIENT_ID,
  clientSecret: process.env.GN_CLIENT_SECRET,
  sandbox: process.env.NODE_ENV !== 'production'
});

const payMantNotification = async (req, reply) => {
  try{
    console.log("Iniciando a conexão com a efí!");

    console.log(req.headers); 
    console.log(req.body)
    const reqGN = await reqGNAlready;

    if(!reqGN){
      console.log("Conexão perdida!");
       reply.status(417).send({server:"We lost the connection with the Efí API, please try again later!"});
    };

    const {chave} = req.params

    const chaveASerUsada = String(chave);
    
    if(!chaveASerUsada){
      console.log("Usuário não inserir a chave!");
       reply.status(404).send({server:"You need to insert the pix key in the url!"});
    };
    
    console.log(`Procurando chave pix: ${chaveASerUsada}`);
    
    const {webhookUrl} = req.body;

    
    String(webhookUrl);
    
    if(!webhookUrl){
      console.error("Faltou a webhookUrl");
       reply.status(400).send({server:"You need to input the webhookUrl in the body!"});
    };
    console.log(`WEBHOOKRUL: ${webhookUrl}`);
    const response = await reqGN.put(`/v2/webhook/${chaveASerUsada}`, webhookUrl);
    
    if(!response){
      console.error("Não conseguimos pegar a resposta da Efí!");
       reply.status(401).send({server:"We can't get a valid response!"});
    };

     return reply.status(204).send(response);

  }catch (error) {
    console.error('Erro ao listar cobranças:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data
      }
    });

     reply.status(error.response?.status || 500).send({
      error: 'Erro ao listar cobranças',
      details: error.response?.data?.mensagem || error.message
    });
  };
};

const listCharges = async (req, reply) => {
  try {
    console.log('Iniciando listagem de cobranças');
    
    const reqGN = await reqGNAlready;
    console.log('Conexão com API EFI estabelecida');

    const { inicio, fim, status } = req.query;
    const params = {
      inicio: inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      fim: fim || new Date().toISOString()
    };
    
    if (status) {
      params.status = status;
    }

    console.log('Buscando cobranças com parâmetros:', params);
    const response = await reqGN.get('/v2/cob', { params });
    console.log(`${response.data.cobs.length} cobranças encontradas`);

    return reply.send({
      charges: response.data.cobs,
      pagination: {
        totalItems: response.data.parametros.totalRegistros,
        paginaAtual: response.data.parametros.paginaAtual,
        itensPorPagina: response.data.parametros.itensPorPagina,
      }
    });

  } catch (error) {
    console.error('Erro ao listar cobranças:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data
      }
    });

    return reply.status(error.response?.status || 500).send({
      error: 'Erro ao listar cobranças',
      details: error.response?.data?.mensagem || error.message
    });
  }
};

// [SIMULAÇÃO] Função auxiliar para simular confirmação de pagamento
const simulatePaymentConfirmation = async (txid, valor) => {
  console.log("Iniciando simulação")
  // [SIMULAÇÃO] Delay aleatório entre 3 e 8 segundos
  const delay = Math.floor(Math.random() * (8000 - 3000 + 1) + 3000);
  
  // [SIMULAÇÃO] Aguarda o delay
  await new Promise(resolve => setTimeout(resolve, delay));
  console.log("passou do delay")
  // [SIMULAÇÃO] Cria objeto similar ao webhook da Gerencianet
  const webhookData = {
    pix: [{
      endToEndId: `E${txid}${Date.now()}`,
      txid: txid,
      valor: valor,
      horario: new Date().toISOString(),
      infoPagador: "Pagamento PIX simulado"
    }]
  };

  // [SIMULAÇÃO] Emite o evento para o cliente que está aguardando
  const callback = pendingPayments.get(txid);
  if (callback) {
    callback(webhookData);
    pendingPayments.delete(txid);
  }
  console.log(webhookData)
  return webhookData;
};

// [SIMULAÇÃO] Endpoint para aguardar confirmação do pagamento
const waitForPayment = async (req, reply) => {
  const { txid } = req.params;

  if (!txid) {
    return reply.status(400).send({ error: 'txid é obrigatório' });
  }

  try {
    // [SIMULAÇÃO] Cria uma Promise que será resolvida quando o pagamento for simulado
    const paymentData = await new Promise((resolve) => {
      pendingPayments.set(txid, resolve);

      // [SIMULAÇÃO] Timeout após 2 minutos
      setTimeout(() => {
        pendingPayments.delete(txid);
        resolve(null);
      }, 120000);
    });

    // [SIMULAÇÃO] Verifica timeout
    if (!paymentData) {
      return reply.status(408).send({ error: 'Timeout aguardando pagamento' });
    }

    return reply.send(paymentData);
  } catch (error) {
    console.error('Erro ao aguardar pagamento:', error);
    return reply.status(500).send({ error: 'Erro interno ao aguardar pagamento' });
  }
};

// [SIMULAÇÃO] Esta é a versão original do webhook que você vai usar em produção
const webhook = async (req, reply) => {
  console.log("Webhook recebido");
  try {
    console.log(req.body);
    return reply.status(200).send();
  } catch (error) {
    console.error('Erro no webhook:', error);
    return reply.status(500).send(error);
  }
};

const generateQRCode = async (req, reply) => {
  try {
    console.log('Iniciando geração de QR Code Pix');
    
    const reqGN = await reqGNAlready;
    console.log('Conexão com API EFI estabelecida');
    
    const { valor, descricao } = req.body;
    console.log('Dados recebidos:', { valor, descricao });
    
    if (!valor || !descricao) {
      console.log('Erro: dados obrigatórios faltando');
      return reply.status(400).send({
        error: 'Valor e descrição são obrigatórios'
      });
    }

    console.log('Criando cobrança...');
    const dataCob = {
      calendario: {
        expiracao: 3600
      },
      valor: {
        original: valor.toFixed(2)
      },
      chave: process.env.PIX_KEY,
      solicitacaoPagador: descricao
    };
    
    console.log('Payload da cobrança:', dataCob);

    const cobResponse = await reqGN.post('/v2/cob', dataCob);
    console.log('Resposta da criação da cobrança:', cobResponse.data);
    
    if (!cobResponse.data.loc || !cobResponse.data.loc.id) {
      throw new Error('ID da localização não retornado pela API');
    }

    console.log(`Gerando QR Code para loc.id: ${cobResponse.data.loc.id}`);
    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`);
    console.log('QR Code gerado com sucesso');

    // [SIMULAÇÃO] Inicia a simulação do pagamento
    simulatePaymentConfirmation(cobResponse.data.txid, valor);

    return reply.send({
      qrcode: qrcodeResponse.data.imagemQrcode,
      txid: cobResponse.data.txid,
      copiaCola: qrcodeResponse.data.qrcode
    });

  } catch (error) {
    console.error('Erro detalhado:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      },
      request: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        data: error.config?.data
      }
    });

    return reply.status(error.response?.status || 500).send({
      error: 'Erro ao gerar QR Code',
      details: error.response?.data?.mensagem || error.message
    });
  }
};

module.exports = {
  generateQRCode,
  listCharges,
  waitForPayment,  // [SIMULAÇÃO] Remover em produção
  webhook,
  payMantNotification
};