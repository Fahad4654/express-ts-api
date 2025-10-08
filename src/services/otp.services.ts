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
    user.save;
    return {
      status: "success",
      message: "OTP verified successfully & User verified successfully!",
    };
  }

  return { message: "OTP verified successfully" };
}
