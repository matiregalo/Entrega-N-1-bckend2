import { MailService } from "../services/mail.service.js";
import UserDAO from "../dao/user.dao.js";
import crypto from "crypto";
import { config } from "../config/config.js";

const mailService = new MailService();
const userDAO = new UserDAO();

export const forgotPassword = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).send({
        status: "error",
        message: 'El campo "to" (email) es requerido',
      });
    }

    const user = await userDAO.getByEmail(to);
    if (!user) {
      return res.json({
        status: "success",
        message: "Si el email existe, recibirás un enlace de recuperación",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000);

    await userDAO.updateResetToken(user._id, resetToken, resetTokenExpires);

    const frontendUrl =
      process.env.FRONTEND_URL || `http://localhost:${config.PORT || 3000}`;
    const recoveryLink = `${frontendUrl}/reset-password.html?token=${resetToken}`;

    try {
      const info = await mailService.sendTestMail(to, recoveryLink);

      return res.json({
        status: "success",
        message: "Email de recuperación enviado exitosamente",
      });
    } catch (mailError) {
      return res.status(500).send({
        status: "error",
        message: "Error al enviar el email de prueba",
        error: mailError.message,
        details: mailError.code || "Sin código de error",
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
};
