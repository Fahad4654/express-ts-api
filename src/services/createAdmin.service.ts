import { User } from "../models/User"; // Adjust path
import bcrypt from "bcryptjs";
import { ADMIN_NAME, ADMIN_MAIL, ADMIN_PASSWORD, ADMIN_PHONENUMBER } from "../config";

export async function createAdmin() {
  const adminExists = await User.findOne({
    where: { email: ADMIN_MAIL },
  });

  if (!adminExists) {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_MAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10), // Change this password!
      isAdmin: true,
      phoneNumber: ADMIN_PHONENUMBER,
    });
    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️ Admin user already exists");
  }
}

