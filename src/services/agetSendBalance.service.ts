import { Account } from "../models/Account";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { User } from "../models/User";
import { findByDynamicId } from "./find.service";

export async function transferBalanceTranscationCreation(data: any) {
  console.log(`[Service] Creating new transaction`, data);
  const { status, ...rest } = data; // remove status if present
  const payload = { ...rest, status: "pending" };

  const {
    balanceId,
    accountId,
    userId,
    createdBy,
    type,
    direction,
    amount,
    currency,
    trxId,
  } = data;

  const typedUser = await findByDynamicId(User, { id: userId }, false);
  const user = typedUser as User | null;
  console.log(user);

  if (!user) throw new Error("User not found");
  const senderUserId = createdBy;
  const typedSenderUser = await findByDynamicId(
    User,
    { id: senderUserId },
    false
  );
  const senderUser = typedSenderUser as User | null;
  console.log(senderUser);
  if (!senderUser) {
    throw new Error("Sender user not found");
  }

  if (
    senderUser.id !== user.id &&
    user.createdBy !== senderUser.id &&
    !senderUser.isAdmin
  ) {
    throw new Error(
      "Only admin or user's agent can create transaction for this user"
    );
  }

  const typedAccount = await findByDynamicId(Account, { id: accountId }, false);
  const account = typedAccount as Account | null;
  console.log(account);
  if (!account) throw new Error("Account not found");

  if (account.userId !== userId)
    throw new Error("Account does not belong to the specified user");

  const typedBalance = await findByDynamicId(Balance, { id: balanceId }, false);
  const balance = typedBalance as Balance | null;
  if (!balance) throw new Error("Balance not found");

  if (balance.accountId !== accountId)
    throw new Error("Balance does not belong to the specified account");

  if (!type) throw new Error("Type not found");
  if (type !== "transfer"){
    throw new Error("Invalid type. Type must be 'transfer'");
  }

  if (!direction) throw new Error("Direction not found");

  if (!amount) throw new Error("Amount not found");

  if (!currency) throw new Error("Currency not found");

  if (!trxId) throw new Error("trxId not found");

  if (Number(amount) < 100)
    throw new Error("Amount should be more than or equal to 100");
  if (Number(amount) > 10000 && direction === "debit")
    throw new Error("Amount should be less than or equal to 10000");

  const newTransaction = await BalanceTransaction.create(payload);
  console.log(
    `[Service] Transaction created successfully with ID: ${newTransaction.id}`
  );
  return newTransaction;
}
