import { ADMIN_MAIL, COMPANY_NAME } from "../config";
import { MailService } from "./mail/mail.service";
import { sequelize } from "../config/database";
import { Account } from "../models/Account";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { User } from "../models/User";
import { findByDynamicId } from "./find.service";

const mailService = new MailService();

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
  if (type !== "transfer") {
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

export async function confirmTransfer(
  balanceId: string,
  transactionId: string,
  approvedBy?: string
) {
  return sequelize.transaction(async (t) => {
    const balance = await Balance.findByPk(balanceId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const findSenderUser = await findByDynamicId(
      User,
      { id: approvedBy },
      false
    );
    const senderUser = findSenderUser as User | null;
    console.log(senderUser);
    if (!senderUser) {
      throw new Error("Approving user not found");
    }
    const findAccountOfsender = await findByDynamicId(
      Account,
      { userId: senderUser.id },
      false
    );
    const accountOfSender = findAccountOfsender as Account | null;
    console.log(accountOfSender);
    if (!accountOfSender) {
      throw new Error("Approving user account not found");
    }

    const findBalanceOfSender = await Balance.findOne({
      where: { accountId: accountOfSender.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    const balanceOfSender = findBalanceOfSender as Balance | null;
    console.log(balanceOfSender);
    if (!balanceOfSender) {
      throw new Error("Approving user balance not found");
    }

    if (!balance) {
      throw new Error("Balance not found");
    }

    const transaction = await BalanceTransaction.findByPk(transactionId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.type !== "transfer") {
      throw new Error(
        "Use standard panel to complete non-transfer transactions"
      );
    }

    if (transaction.status === "completed") {
      console.log("Transaction is already completed");
      throw new Error("Transaction is already completed");
    }

    if (transaction.direction === "credit") {
      if (
        balanceOfSender.availableBalance < Number(transaction.amount) &&
        senderUser.isAdmin === false
      ) {
        // Insufficient funds → mark as failed and save first
        transaction.status = "failed";
        await transaction.save({ transaction: t });

        const foundUser = await findByDynamicId(
          User,
          { id: transaction.userId },
          false
        );
        const user = foundUser as User | null;

        if (user) {
          await mailService.sendMail(
            user.email,
            "Transaction Failed",
            "Your transaction could not be completed.",
            undefined, // HTML will come from template
            "transaction-failed", // Handlebars template
            {
              user: user.get({ plain: true }),
              transaction: transaction.get({ plain: true }),
              balance: balance.get({ plain: true }),
              year: new Date().getFullYear(),
              companyName: `${COMPANY_NAME}`,
              supportEmail: ADMIN_MAIL,
            }
          );
        }
        if (approvedBy && approvedBy !== transaction.userId) {
          const approvingUser = await findByDynamicId(
            User,
            { id: approvedBy },
            false
          );
          const appUser = approvingUser as User | null;

          if (appUser) {
            await mailService.sendMail(
              appUser.email,
              "Transaction Failed",
              "The transaction you approved could not be completed due to insufficient funds.",
              undefined, // HTML will come from template
              "transaction-failed-approver", // Handlebars template
              {
                user: appUser.get({ plain: true }),
                transaction: transaction.get({ plain: true }),
                balance: balanceOfSender.get({ plain: true }),
                year: new Date().getFullYear(),
                companyName: `${COMPANY_NAME}`,
                supportEmail: ADMIN_MAIL,
              }
            );
          }
        }
        // Stop further execution without throwing inside the same transaction
        return { balance, transaction, error: "Insufficient funds" };
      }
      balance.availableBalance =
        Number(balance.availableBalance) + Number(transaction.amount);

      balanceOfSender.availableBalance =
        Number(balanceOfSender.availableBalance) - Number(transaction.amount);
      transaction.status = "completed";
    }
    // else if (transaction.direction === "debit") {
    //   if (
    //     Number(balance.availableBalance) < Number(transaction.amount) ||
    //     Number(balance.withdrawableBalance) < Number(transaction.amount)
    //   ) {
    //     // Insufficient funds → mark as failed and save first
    //     transaction.status = "failed";
    //     await transaction.save({ transaction: t });

    //     const foundUser = await findByDynamicId(
    //       User,
    //       { id: transaction.userId },
    //       false
    //     );
    //     const user = foundUser as User | null;

    //     if (user) {
    //       await mailService.sendMail(
    //         user.email,
    //         "Transaction Failed",
    //         "Your transaction could not be completed.",
    //         undefined, // HTML will come from template
    //         "transaction-failed", // Handlebars template
    //         {
    //           user: user.get({ plain: true }),
    //           transaction: transaction.get({ plain: true }),
    //           balance: balance.get({ plain: true }),
    //           year: new Date().getFullYear(),
    //           companyName: `${COMPANY_NAME}`,
    //           supportEmail: ADMIN_MAIL,
    //         }
    //       );
    //     }
    //     // Stop further execution without throwing inside the same transaction
    //     return { balance, transaction, error: "Insufficient funds" };
    //   }
    //   balance.availableBalance =
    //     Number(balance.availableBalance) - Number(transaction.amount);
    //   balance.withdrawableBalance =
    //     Number(balance.withdrawableBalance) - Number(transaction.amount);
    //   transaction.status = "completed";
    // }

    transaction.approvedAt = new Date();
    transaction.approvedBy = approvedBy;
    await transaction.save({ transaction: t });

    balance.lastTransactionAt = new Date();
    await balance.save({ transaction: t });
    balanceOfSender.lastTransactionAt = new Date();
    await balanceOfSender.save({ transaction: t });

    const foundUser = await findByDynamicId(
      User,
      { id: transaction.userId },
      false
    );
    const user = foundUser as User | null;
    if (user) {
      await mailService.sendMail(
        user.email,
        "Transaction Successful",
        "Your transaction has been completed successfully.",
        undefined, // HTML will come from template
        "transaction-success", // Handlebars template name
        {
          user: user.get({ plain: true }),
          transaction: transaction.get({ plain: true }),
          balance: balance.get({ plain: true }),
          year: new Date().getFullYear(),
          supportEmail: ADMIN_MAIL,
          companyName: `${COMPANY_NAME}`,
        }
      );
    }

    return { balance, transaction };
  });
}
