const configProd = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
    
    const configLocal = {
      host: 'localhost',
      port: '1025',
    };
    
    const MAIL_TRANSPORT_CONFIG =
      process.env.NODE_ENV === "prod" ? configProd : configLocal;
    
    module.exports = { MAIL_TRANSPORT_CONFIG };