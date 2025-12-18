import nodemailer from "nodemailer";
import { config } from "../config/config.js";

export class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
    });
  }
  async sendTestMail(to, recoveryLink = "#") {
    if (!config.mail.user || !config.mail.pass || !config.mail.from) {
      const missing = [];
      if (!config.mail.user) missing.push("MAIL_USER");
      if (!config.mail.pass) missing.push("MAIL_PASS");
      if (!config.mail.from) missing.push("MAIL_FROM");
      throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
    }

    const mailOptions = {
      from: config.mail.from,
      to,
      subject: "Recuperar contraseña de Ecommerce Backend2",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Recuperación de contraseña</h1>
          <p style="color: #666; font-size: 16px;">Haz click en el siguiente enlace para recuperar tu contraseña:</p>
          <a href="${recoveryLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Recuperar contraseña</a>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
    };

    try {
      console.log(`📧 Intentando enviar email a: ${to}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado exitosamente. Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error("❌ Error al enviar email:", error.message);
      if (error.code === "EAUTH") {
        throw new Error("Error de autenticación. Verifica que MAIL_PASS sea una 'Contraseña de aplicación' de Gmail (no tu contraseña normal). Ve a: https://myaccount.google.com/apppasswords");
      }
      throw error;
    }
  }
}
