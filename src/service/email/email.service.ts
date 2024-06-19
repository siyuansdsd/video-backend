import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export class EmailService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  sendVerificationEmail = async (email: string, token: string) => {
    const mailOptions = {
      from: `"VideoAI" <${process.env.EMAIL_ADDRESS}>`,
      to: email,
      subject: "Verification Email",
      text: `Please click this link to verify your email: ${process.env.CLIENT_URL}/email_verify/${token}`,
    };

    await this.transporter.sendMail(mailOptions);
  };
}
