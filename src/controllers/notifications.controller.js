import { MailService } from "../services/mail.service";
const mailService = new MailService();

export const sendMail = async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).send({
        status: "error",
        error: 'Falta "to" en el body',
      });
    }
    const info = await mailService.sendTestMail(to);
    return res.json({ status: "success", messageId: info.messageId });
  } catch (error) {
    return res.status(500).send({status: 'error', error: error.message})
  }
};
