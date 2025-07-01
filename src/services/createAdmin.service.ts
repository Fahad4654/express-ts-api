import { User } from "../models/User"; // Adjust path
import bcrypt from "bcryptjs";

export async function createAdmin() {
  const adminExists = await User.findOne({
    where: { email: "admin@example.com" },
  });

  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10), // Change this password!
      isAdmin: true,
      phoneNumber: "1234567890",
    });
    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️ Admin user already exists");
  }
}

