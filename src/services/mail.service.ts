import nodemailer from "nodemailer";

export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      await this.transporter.sendMail({
        from: `"Game App" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`[MailService] Mail sent to ${to}`);
    } catch (error) {
      console.error("[MailService] Failed to send mail:", error);
      throw new Error("Failed to send email");
    }
  }
}
