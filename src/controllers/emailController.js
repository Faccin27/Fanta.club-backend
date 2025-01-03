const EmailService = require('../service/emailservice');

class SendEmailHandler {
    async sendEmail(req, reply) {
        const { to, subject, text, html } = req.body;
        const emailService = new EmailService();
        
        const result = await emailService.sendEmail(to, subject, text, html);
        return result.success 
            ? reply.send({ message: "Email enviado com sucesso!" })
            : reply.code(500).send({ error: "Erro ao enviar email." });
    }
}

module.exports = SendEmailHandler;
