import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Profile } from "../models/Profile";
import { createProfile, referralCode } from "./profile.service";
import { createBalance } from "./balance.service";
import * as accountService from "./account.service";
import { Op } from "sequelize";
import { ADMIN_NAME } from "../config";
import { Account } from "../models/Account";
import { Balance } from "../models/Balance";
import { MailService } from "./mail/mail.service";

const mailService = new MailService();

export const generateToken = (id: string): string => {
  return id.slice(-9).toUpperCase(); // Take last 9 chars and uppercase
};

export async function findAllUsers(
  order = "id",
  asc: "ASC" | "DESC" = "ASC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;

  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Profile,
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
      {
        model: Account,
        attributes: {
          exclude: ["userId", "currency", "createdAt", "updatedAt"],
        },
        include: [
          {
            model: Balance,
            attributes: {
              exclude: ["accountId", "createdAt", "updatedAt"],
            },
          },
        ],
      },
    ],
    nest: true,
    raw: false, // remove raw so nested JSON works correctly
    limit: pageSize,
    offset,
    order: [[order, asc]],
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  referredCode?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newUser = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phoneNumber: data.phoneNumber,
    isAdmin: data.isAdmin,
  });
  console.log("user created", newUser);

  await mailService.sendMail(
    newUser.email,
    "User Created",
    `User Creation is completed`,
    `<!DOCTYPE html>
      <html>
        <body>
          <p>Hi <strong>${newUser.name}</strong>,</p>
          <p>Welcome to <strong>Game App</strong>! Your account has been successfully created.</p>
          <p>You can log in using your email: <strong>${newUser.email}</strong></p>
          <p>We hope you enjoy playing games and earning rewards!</p>
          <br/>
          <p>Best regards,<br/>Game App Team</p>
        </body>
      </html>`
  );

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

export async function deleteUser(identifier: {
  email?: string;
  id?: string;
  phoneNumber?: string;
}) {
  if (!identifier.email && !identifier.id && !identifier.phoneNumber) {
    throw new Error(
      "At least one identifier (email, id, or phoneNumber) is required"
    );
  }

  return User.destroy({
    where: {
      [Op.or]: [
        identifier.email ? { email: identifier.email } : undefined,
        identifier.id ? { id: identifier.id } : undefined,
        identifier.phoneNumber
          ? { phoneNumber: identifier.phoneNumber }
          : undefined,
      ].filter(Boolean) as any,
    },
  });
}
