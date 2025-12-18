import { MailService } from "../services/mail.service.js";
import UserDAO from "../dao/user.dao.js";
import crypto from "crypto";
import { config } from "../config/config.js";

const mailService = new MailService();
const userDAO = new UserDAO();

// Endpoint de prueba simple para verificar que el email funciona
// Ahora usa el mismo formato de enlace que forgotPassword
export const testEmail = async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).send({
        status: "error",
        message: 'El campo "to" (email) es requerido',
      });
    }

    console.log(`📧 [TEST] Intentando enviar email de prueba a: ${to}`);
    
    // Generar enlace igual que forgotPassword
    const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${config.PORT || 3000}`;
    const testToken = "test-token-12345"; // Token de prueba
    const recoveryLink = `${frontendUrl}/reset-password.html?token=${testToken}`;
    
    console.log(`🔗 [TEST] Enlace generado: ${recoveryLink}`);
    
    try {
      const info = await mailService.sendTestMail(to, recoveryLink);
      
      return res.json({
        status: "success",
        message: "Email de prueba enviado exitosamente",
        messageId: info.messageId,
        recoveryLink: recoveryLink, // Devolver el enlace para verificar
        accepted: info.accepted,
        rejected: info.rejected,
      });
    } catch (mailError) {
      console.error("❌ [TEST] Error enviando email:", mailError.message);
      
      return res.status(500).send({
        status: "error",
        message: "Error al enviar el email de prueba",
        error: mailError.message,
        details: mailError.code || "Sin código de error",
      });
    }
  } catch (error) {
    console.error("❌ [TEST] Error en testEmail:", error);
    return res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).send({
        status: "error",
        message: 'El campo "email" es requerido',
      });
    }
    const user = await userDAO.getByEmail(email);
        if (!user) {
      return res.json({
        status: "success",
        message: "Si el email existe, recibirás un enlace de recuperación",
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en el usuario
    await userDAO.updateResetToken(user._id, resetToken, resetTokenExpires);

    // Generar enlace de recuperación (apunta al HTML estático)
    // IMPORTANTE: La ruta NO debe incluir /public/ porque Express.static ya mapea public/ a la raíz
    const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${config.PORT || 3000}`;
    const recoveryLink = `${frontendUrl}/reset-password.html?token=${resetToken}`;

    // Enviar email
    try {
      console.log(`📧 Intentando enviar email de recuperación a: ${email}`);
      console.log(`🔗 Enlace generado: ${recoveryLink}`);
      const info = await mailService.sendTestMail(email, recoveryLink);
      console.log(`✅ Email de recuperación enviado. Message ID: ${info.messageId}`);
      
      return res.json({
        status: "success",
        message: "Email de recuperación enviado exitosamente",
        messageId: info.messageId,
      });
    } catch (mailError) {
      console.error("❌ Error enviando email:", mailError.message);
      
      // Devolver el error en la respuesta para que se vea en Postman
      return res.status(500).send({
        status: "error",
        message: "Error al enviar el email de recuperación",
        error: mailError.message,
        code: mailError.code || "Sin código",
        hint: mailError.code === "EAUTH" 
          ? "Verifica que MAIL_PASS sea una 'Contraseña de aplicación' de Gmail" 
          : "Revisa la configuración de email en tu .env",
      });
    }
  } catch (error) {
    console.error("❌ Error en forgotPassword:", error);
    return res.status(500).send({ 
      status: "error", 
      message: error.message 
    });
  }
};
