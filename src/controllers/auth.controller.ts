import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Token } from "../models/Token";
import {
  SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from "../config";
import { Profile } from "../models/Profile";
import { generateToken } from "./users.controller";

// Helper function to generate tokens
const generateTokens = async (user: User) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRATION } as jwt.SignOptions
  );

  const refreshToken = jwt.sign({ id: user.id }, SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  } as jwt.SignOptions);

  // Store refresh token in database
  await Token.create({
    token: refreshToken,
    isRefreshToken: true,
    expiresAt: new Date(Date.now() + parseInt(REFRESH_TOKEN_EXPIRATION)), // 7 days
    userId: user.id,
  });

  return { accessToken, refreshToken };
};

export const register: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Validation
    if (!name || !email || !password || !phoneNumber) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // const user = await User.create({
    //   name,
    //   email,
    //   password: hashedPassword,
    //   phoneNumber,
    //   isAdmin: false,
    // });
    //     await Profile.create({
    //       userId: newUser.id,
    //       bio: "Please Edit",
    //       address: "Please Edit",
    //       referralCode: referralCode,
    //     });

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
      referralCode: referralCode,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(newUser);

    // Return response without password
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      accessToken,
      refreshToken,
    });
    return;
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(password);
    // const isMatch = password === user.password;
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // Return response without password
    const userResponse = user.toJSON();
    delete userResponse.password;
    console.log(userResponse.email, "logged in");

    res.json({
      message: "Login successful",
      user: userResponse,
      accessToken,
      refreshToken,
    });
    return;
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log("Refresh token is required");
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    // Find token first
    const tokenData = await Token.findOne({ where: { token: refreshToken } });

    if (!tokenData) {
      console.log("Token not found or already logged out");
      res
        .status(404)
        .json({ message: "Token not found or already logged out" });
      return;
    }

    // Find the user before deleting token
    const user = await User.findOne({ where: { id: tokenData.userId } });

    // Delete the refresh token
    await Token.destroy({ where: { token: refreshToken } });

    console.log(user?.email || "Unknown user", "Logged out successfully");

    res.status(200).json({ message: "Logged out successfully" });
    return;
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    // Verify refresh token
    const payload = jwt.verify(refreshToken, SECRET) as { id: string };

    // Check if token exists in database
    const tokenRecord = await Token.findOne({
      where: {
        token: refreshToken,
        isRefreshToken: true,
      },
      include: [User],
    });

    if (!tokenRecord) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        isAdmin: tokenRecord.user.isAdmin,
      },
      SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION } as jwt.SignOptions
    );

    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
    return;
  } catch (error) {
    console.error("Refresh token error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ message: "Refresh token expired" });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
