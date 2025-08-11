import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Token } from "../models/Token";
import { Profile } from "../models/Profile";
import {
  SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from "../config";
import { generateToken } from "./user.service";

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
  }) {
    const { name, email, password, phoneNumber } = data;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      isAdmin: false,
    });

    const referralCode = `FK-${generateToken(newUser.id)}`;

    await Profile.create({
      userId: newUser.id,
      bio: "Please Edit",
      address: "Please Edit",
      referralCode,
    });

    return newUser;
  }

  static async loginUser(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Invalid credentials");
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
