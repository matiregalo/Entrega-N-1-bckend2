import nodemailer from "nodemailer";
import { config } from "./config/config.js";

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
  async sendTestMail(to) {
    const mailOptions = {
      from: config.mail.from,
      to,
      subject: "Test Email",
      html: `
        <h1>This is a test email</h1>
        <p>If you see this email, mailService is working correctly</p>
        `,
    };
    return this.transporter.sendMail(mailOptions);
  }
}
