import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Profile } from "../models/Profile";
import { createProfile } from "./profile.service";
import { createBalance } from "./balance.service";
import * as accountService from "./account.service";

export const generateToken = (id: string): string => {
  return id.slice(-9).toUpperCase(); // Take last 9 chars and uppercase
};

export async function findAllUsers(order = "id", asc = "ASC") {
  return User.findAll({
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Profile,
        // Optionally exclude profile fields if needed
        attributes: {
          exclude: [
            "userId",
            "createdBy",
            "updatedBy",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    ],
    nest: true,
    raw: true,
    order: [[order, asc]],
  });
}

export async function findUserById(userId: string) {
  const user = User.findOne({
    where: { id: userId },
    attributes: ["id", "name", "email", "isAdmin", "phoneNumber"],
  });
  return user;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isAdmin?: boolean;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newUser = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phoneNumber: data.phoneNumber,
    isAdmin: data.isAdmin,
  });
  console.log("user created", newUser)

  await createProfile({
    userId: newUser.id,
    bio: "Please Edit",
    address: "Please Edit",
  });
  console.log("Profile created for", newUser.email)
  const newAccount = await accountService.createAccount(newUser.id, "BDT");
  console.log("Account created for", newUser.email)
  await createBalance({
    accountId: newAccount.id,
    availableBalance: 0,
    pendingBalance: 0,
    holdBalance: 0,
    currency: newAccount.currency,
  });
  console.log("Profile created for", newUser.email)
  return newUser;
}

export async function updateUser(data: Partial<User> & { id: string }) {
  const user = await User.findOne({ where: { id: data.id } });
  if (!user) return null;

  const allowedFields: Array<keyof User> = [
    "name",
    "email",
    "password",
    "isAdmin",
    "phoneNumber",
  ];
  const updates: Partial<User> = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  if (Object.keys(updates).length === 0) return null;

  await user.update(updates);
  return User.findByPk(user.id, {
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
}

export async function deleteUserByEmail(email: string) {
  return User.destroy({ where: { email } });
}
