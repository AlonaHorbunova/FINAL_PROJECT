import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Настройки берутся из файла .env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // ДОБАВИЛИ ЭТОТ БЛОК ДЛЯ ОБХОДА БЛОКИРОВКИ АНТИВИРУСА
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"ICHGRAM" <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
