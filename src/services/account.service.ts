import { Account } from "../models/Account";
import { User } from "../models/User";

export function generateAccountNumber(): string {
  const timestamp = Date.now().toString().slice(-8); // last 8 digits of ms time
  const random = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `AC-${timestamp}${random}`;
}

export async function getAccounts(
  order: string,
  asc: string,
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Account.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
    nest: true,
    raw: true,
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
