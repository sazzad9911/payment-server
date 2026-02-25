import ApiError from "../errors/ApiErrors";
import nodemailer from "nodemailer";

export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const otpGenerator = async (email: string) => {
  const otp = generate6DigitCode();

  if (!process.env.EMAIL || !process.env.APP_PASS) {
    throw new ApiError(500, "Email credentials not configured");
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"OazPay" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>OazPay OTP Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return otp;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Failed to send OTP email");
  }
};
