import { Otp } from "../models/Otp";
import { User } from "../models/User";
import { MailService } from "./mail.service";

const mailService = new MailService();

/**
 * Step 1: Send OTP
 */

export async function sendOtp(identifier: string, type: string) {
  const user = await User.findOne({
    where: { [identifier.includes("@") ? "email" : "phoneNumber"]: identifier },
  });
  if (!user) throw new Error("User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.destroy({ where: { userId: user.id } });
  await Otp.create({
    userId: user.id,
    otp,
    type,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    verified: false,
  });

  if (type == "register") {
    await mailService.sendMail(
      user.email,
      "User Verification OTP",
      `Your OTP is ${otp}`,
      `<p>Your OTP for User verification is <b>${otp}</b>. It expires in 10 minutes.</p>`
    );
    return { message: "OTP sent successfully" };
  }

  await mailService.sendMail(
    user.email,
    "Password Reset OTP",
    `Your OTP is ${otp}`,
    `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 10 minutes.</p>`
  );

  return { message: "OTP sent successfully" };
}

/**
 * Step 2: Verify OTP
 */
export async function verifyOtp(identifier: string, otp: string) {
  const user = await User.findOne({
    where: { [identifier.includes("@") ? "email" : "phoneNumber"]: identifier },
  });
  if (!user) throw new Error("User not found");

  const token = await Otp.findOne({
    where: { userId: user.id, otp },
  });
  if (!token) throw new Error("Invalid OTP");
  if (token.expiresAt.getTime() < Date.now()) {
    await token.destroy();
    throw new Error("OTP expired");
  }

  token.verified = true;
  await token.save();
  if (token.type == "register") {
    user.isVerified = true;
    user.save();
    await mailService.sendMail(
      user.email,
      "User Created",
      `User Creation is completed`,
      `<!DOCTYPE html>
      <html>
        <body>
          <p>Hi <strong>${user.email}</strong>,</p>
          <p>Welcome to <strong>Game App</strong>! Your account has been successfully created.</p>
          <p>You can log in using your email: <strong>${user.email}</strong></p>
          <p>We hope you enjoy playing games and earning rewards!</p>
          <br/>
          <p>Best regards,<br/>Game App Team</p>
        </body>
      </html>`
    );
    return {
      status: "success",
      message: "OTP verified successfully & User verified successfully!",
    };
  }

  return { message: "OTP verified successfully" };
}
