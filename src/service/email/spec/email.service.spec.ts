import nodemailer from "nodemailer";
import { EmailService } from "../email.service";

jest.mock("nodemailer");

describe("EmailService", () => {
  let emailService: EmailService;
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    sendMailMock = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
    emailService = new EmailService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send a verification email", async () => {
    const email = "test@example.com";
    const token = "testToken";

    await emailService.sendVerificationEmail(email, token);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: `"VideoAI" <${process.env.EMAIL_ADDRESS}>`,
      to: email,
      subject: "Verification Email",
      text: `Please click this link to verify your email: ${process.env.CLIENT_URL}/email_verify/${token}`,
    });
  });

  it("should handle errors when sending email", async () => {
    sendMailMock.mockRejectedValue(new Error("Failed to send email"));
    const email = "test@example.com";
    const token = "testToken";

    await expect(
      emailService.sendVerificationEmail(email, token)
    ).rejects.toThrow("Failed to send email");
  });
});
