import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Настройки берутся из файла .env (мы настроим его в шаге 4)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true", // true для порта 465, false для других
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"ICHGRAM" <${process.env.SMTP_USER}>`, // Имя отправителя и его email
    to: options.email, // Кому отправляем
    subject: options.subject, // Тема письма
    html: options.html, // Тело письма в формате HTML
  };

  // Отправляем письмо
  await transporter.sendMail(mailOptions);
};
