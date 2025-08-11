import { RequestHandler } from "express";
import { AuthService } from "../services/auth.service";

export const register: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const newUser = await AuthService.registerUser({
      name,
      email,
      password,
      phoneNumber,
    });
    const tokens = await AuthService.generateTokens(newUser);

    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      ...tokens,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Registration failed" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await AuthService.loginUser(email, password);
    const tokens = await AuthService.generateTokens(user);

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: "Login successful",
      user: userResponse,
      ...tokens,
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Invalid credentials" });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }
    await AuthService.logoutUser(refreshToken);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Logout failed" });
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }
    const newAccessToken = await AuthService.refreshAccessToken(refreshToken);
    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(403).json({ message: "Refresh token expired" });
      return;
    }
    if (error.name === "JsonWebTokenError") {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
