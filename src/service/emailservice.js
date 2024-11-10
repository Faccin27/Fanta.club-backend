require('dotenv').config();
const nodemailer = require("nodemailer");
const { MAIL_TRANSPORT_CONFIG } = require('../config/emailConfig');

class EmailService {
    constructor() {
        this.smtp = nodemailer.createTransport(
            MAIL_TRANSPORT_CONFIG
        );
    }

    async sendEmail(to, subject, text, html = null) {
        try {
            const info = await this.smtp.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html
            });
            console.log("Email enviado: %s", info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error("Erro ao enviar o email: ", error);
            return { success: false, error };
        }
    }
}

module.exports = EmailService;
