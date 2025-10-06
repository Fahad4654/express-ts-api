import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Token } from "../models/Token";
import * as accountService from "./account.service";
import {
  SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  ADMIN_NAME,
} from "../config";
import { createBalance } from "./balance.service";
import { createProfile } from "./profile.service";
import { Op } from "sequelize";
import { Profile } from "../models/Profile";
import { MailService } from "./mail.service";
import { PasswordResetToken } from "../models/PasswordResetToken";

const mailService = new MailService();

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateTokens(user: User) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION } as SignOptions
    );

    const refreshToken = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION ? REFRESH_TOKEN_EXPIRATION : "7d",
    } as SignOptions);

    await Token.create({
      token: refreshToken,
      isRefreshToken: true,
      expiresAt: new Date(Date.now() + parseInt(REFRESH_TOKEN_EXPIRATION, 10)),
      userId: user.id,
    });

    return { accessToken, refreshToken };
  }

  static async registerUser(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    referredCode?: string;
  }) {
    const { name, email, password, phoneNumber } = data;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phoneNumber }],
      },
    });
    if (existingUser) {
      if (
        existingUser.email === email &&
        existingUser.phoneNumber === phoneNumber
      ) {
        console.log("User already exists");
        throw new Error("User already exists");
      } else if (existingUser.email === email) {
        console.log("Email matched");
        throw new Error("Email already exists");
      } else if (existingUser.phoneNumber === phoneNumber) {
        console.log("Phone number matched");
        throw new Error("Phone number already exists");
      }
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      isAdmin: false,
    });

    const admin = await User.findOne({ where: { name: `${ADMIN_NAME}` } });
    const adminProfile = await Profile.findOne({
      where: { userId: admin?.id },
    });
    await createProfile({
      userId: newUser.id,
      bio: "Please Edit",
      address: "Please Edit",
      referredCode: data.referredCode
        ? data.referredCode
        : adminProfile?.referralCode,
    });
    console.log("Profile created for", newUser.email);
    const newAccount = await accountService.createAccount(newUser.id, "BDT");
    console.log("Account created for", newUser.email);
    await createBalance({
      accountId: newAccount.id,
      availableBalance: 0,
      holdBalance: 0,
      currency: newAccount.currency,
    });
    console.log("Balance created for", newUser.email);
    return newUser;
  }

  static async loginUser(identifier: string, password: string) {
    // identifier can be email OR phone number
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phoneNumber: identifier }],
      },
    });

    if (!user) {
      throw new Error("User doesn't exist");
    }

    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return user;
  }

  static async logoutUser(refreshToken: string) {
    const tokenData = await Token.findOne({ where: { token: refreshToken } });
    if (!tokenData) {
      throw new Error("Token not found or already logged out");
    }
    await Token.destroy({ where: { token: refreshToken } });
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, SECRET) as { id: string };

      const tokenRecord = await Token.findOne({
        where: {
          token: refreshToken,
          isRefreshToken: true,
        },
        include: [User],
      });

      if (!tokenRecord) {
        throw new Error("Invalid refresh token");
      }

      const newAccessToken = jwt.sign(
        {
          id: tokenRecord.user.id,
          email: tokenRecord.user.email,
          isAdmin: tokenRecord.user.isAdmin,
        },
        SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION } as SignOptions
      );

      return newAccessToken;
    } catch (error) {
      throw error;
    }
  }
}

export async function requestPasswordReset(identifier: string) {
  const user = await User.findOne({
    where: { [identifier.includes("@") ? "email" : "phoneNumber"]: identifier },
  });
  if (!user) throw new Error("User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await PasswordResetToken.destroy({ where: { userId: user.id } });
  await PasswordResetToken.create({
    userId: user.id,
    otp,
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
 * Step 2: Verify OTP and reset password
 */
export async function verifyOtp(identifier: string, otp: string) {
  const user = await User.findOne({
    where: { [identifier.includes("@") ? "email" : "phoneNumber"]: identifier },
  });
  if (!user) throw new Error("User not found");

  const token = await PasswordResetToken.findOne({
    where: { userId: user.id, otp },
  });
  if (!token) throw new Error("Invalid OTP");
  if (token.expiresAt.getTime() < Date.now()) {
    await token.destroy();
    throw new Error("OTP expired");
  }

  token.verified = true;
  await token.save();

  return { message: "OTP verified successfully" };
}

export async function resetPassword(identifier: string, newPassword: string) {
  const user = await User.findOne({
    where: { [identifier.includes("@") ? "email" : "phoneNumber"]: identifier },
  });
  if (!user) throw new Error("User not found");

  const token = await PasswordResetToken.findOne({
    where: { userId: user.id },
  });
  if (!token) throw new Error("No OTP verification found");
  if (!token.verified) throw new Error("OTP not verified");
  if (token.expiresAt.getTime() < Date.now()) {
    await token.destroy();
    throw new Error("OTP expired");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await token.destroy(); // remove after successful reset

  await mailService.sendMail(
    user.email,
    "Password Reset Successful",
    "Your password has been successfully reset.",
    `<p>Your password has been successfully reset. You can now log in.</p>`
  );

  return { message: "Password reset successful" };
}
