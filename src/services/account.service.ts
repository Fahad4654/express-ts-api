import { Account } from "../models/Account";
import { User } from "../models/User";

export function generateAccountNumber(): string {
  const timestamp = Date.now().toString().slice(-8); // last 8 digits of ms time
  const random = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `AC-${timestamp}${random}`;
}

export async function getAccounts(order: string, asc: string) {
  return await Account.findAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
    nest: true,
    raw: true,
    order: [[order, asc]],
  });
}

export async function getAccountByUserId(userId: string) {
  return await Account.findOne({
    where: { userId },
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "phoneNumber"],
      },
    ],
    nest: true,
    raw: true,
  });
}

export async function getAccountById(id: string) {
  return await Account.findOne({
    where: { id },
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "phoneNumber"],
      },
    ],
    nest: true,
    raw: true,
  });
}

export async function createAccount(userId: string, currency: string) {
  return await Account.create({
    userId,
    currency,
    accountNumber: generateAccountNumber(),
  });
}

export async function deleteAccountByUserId(userId: string) {
  // Optionally get user for logging or messages
  const foundUser = await User.findOne({
    where: { id: userId },
    attributes: ["id", "name", "email"],
  });

  const deletedCount = await Account.destroy({
    where: { userId },
  });

  return { deletedCount, foundUser };
}

export async function updateAccountByUserId(
  userId: string,
  updates: Partial<Account>
) {
  const account = await Account.findOne({ where: { userId } });
  if (!account) {
    return null;
  }
  await account.update(updates);
  return await Account.findByPk(account.id, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
}
