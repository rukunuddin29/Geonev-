import { MAIL_FROM, transporter } from "../config/mail";

export const sendPasswordResetOtp = async (
  email: string,
  otp: string
) => {
  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: "Geonev Password Reset OTP",
    text: `Your Geonev password reset OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Geonev Password Reset</h2>

        <p>We received a request to reset your Geonev account password.</p>

        <p>Your OTP is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 20px 0;
        ">
          ${otp}
        </div>

        <p>This OTP will expire in <strong>10 minutes</strong>.</p>

        <p>If you did not request a password reset, you can safely ignore this email.</p>

        <p>— Geonev Team</p>
      </div>
    `,
  });
};