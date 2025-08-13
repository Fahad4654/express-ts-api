import { RequestHandler } from "express";
import { AuthService } from "../services/auth.service";
import { Token } from "../models/Token";
import { User } from "../models/User";

export const register: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      console.log("All fields are required");
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const newUser = await AuthService.registerUser({
      name,
      email,
      password,
      phoneNumber,
    });
    // const tokens = await AuthService.generateTokens(newUser);

    const userResponse = newUser.toJSON();
    delete userResponse.password;

    console.log("User registered successfully", userResponse);
    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      // ...tokens,
    });
    return;
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Registration failed" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Email and password are required");
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await AuthService.loginUser(email, password);
    const tokens = await AuthService.generateTokens(user);

    const userResponse = user.toJSON();
    delete userResponse.password;

    console.log(`${user.email} Logged in successfully`);
    res.json({
      message: "Login successful",
      user: userResponse,
      ...tokens,
    });
    return;
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Invalid credentials" });
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

    await AuthService.logoutUser(refreshToken);
    console.log(user?.email || "Unknown user", "Logged out successfully");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Logout failed" });
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      console.log("Refresh token is required");
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }
    const newAccessToken = await AuthService.refreshAccessToken(refreshToken);
    console.log("Token refreshed successfully");
    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
    return;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      console.log("Refresh token expired");
      res.status(403).json({ message: "Refresh token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      console.log("Invalid refresh token");
      res.status(403).json({ message: "Invalid refresh token" });
    }
    console.log("Internal server error", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
