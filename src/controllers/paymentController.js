// src/routes/paymentRouter.js
const GNRequest = require('../api/gerencianet');

const reqGNAlready = GNRequest({
  clientID: process.env.GN_CLIENT_ID,
  clientSecret: process.env.GN_CLIENT_SECRET,
  sandbox: process.env.NODE_ENV !== 'production'
});

// Handler para listar cobranças
const listCharges = async (req, reply) => {
  try {
    console.log('Iniciando listagem de cobranças');
    
    const reqGN = await reqGNAlready;
    console.log('Conexão com API EFI estabelecida');

    // Parâmetros de paginação e filtros
    const { inicio, fim, status } = req.query;
    const params = {
      inicio: inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // últimos 30 dias por padrão
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
  listCharges
};