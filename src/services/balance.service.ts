import { Balance } from "../models/Balance";
import { Account } from "../models/Account";
import { User } from "../models/User";
import { sequelize } from "../config/database";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { MailService } from "./mail/mail.service";
import { findByDynamicId } from "./find.service";
import { ADMIN_MAIL, COMPANY_NAME } from "../config";

const mailService = new MailService();

export async function findAllBalances(
  order = "createdAt",
  asc = "ASC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Balance.findAndCountAll({
    include: [
      {
        model: Account,
        attributes: ["id", "userId", "accountNumber"],
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
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

export async function createBalance(data: Partial<Balance>) {
  return Balance.create(data);
}

export async function deleteBalanceByAccountId(accountId: string) {
  const deletedCount = await Balance.destroy({ where: { accountId } });
  if (deletedCount === 0) throw new Error("Balance not found");
  return deletedCount;
}

export async function updateBalanceByAccountId(
  accountId: string,
  updates: Partial<Balance>
) {
  return sequelize.transaction(async (t) => {
    const balance = await Balance.findOne({
      where: { accountId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!balance) {
      throw new Error("Balance not found");
    }

    const allowedFields: Array<keyof Balance> = [
      "availableBalance",
      "holdBalance",
      "currency",
      "lastTransactionAt",
    ];

    const filteredUpdates: Partial<Balance> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        if (["availableBalance", "holdBalance"].includes(key)) {
          const numVal = Number(updates[key]);
          if (isNaN(numVal)) {
            throw new Error(`${key} must be a number`);
          }
          filteredUpdates[key] = numVal as any;
        } else if (key === "lastTransactionAt") {
          const dateVal = new Date(updates[key] as any);
          if (isNaN(dateVal.getTime())) {
            throw new Error(`${key} must be a valid date`);
          }
          filteredUpdates[key] = dateVal as any;
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    await balance.update(filteredUpdates, { transaction: t });

    return balance;
  });
}

export async function finalizeTransaction(
  balanceId: string,
  transactionId: string,
  approvedBy?: string
) {
  return sequelize.transaction(async (t) => {
    const balance = await Balance.findByPk(balanceId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
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

    if (transaction.type == "transfer") {
      throw new Error("Use transfer panel to make a Balance transfer");
    }

    if (transaction.status === "completed") {
      console.log("Transaction is already completed");
      throw new Error("Transaction is already completed");
    }

    if (transaction.direction === "credit") {
      balance.availableBalance =
        Number(balance.availableBalance) + Number(transaction.amount);
      transaction.status = "completed";
    } else if (transaction.direction === "debit") {
      if (
        Number(balance.availableBalance) < Number(transaction.amount) ||
        Number(balance.withdrawableBalance) < Number(transaction.amount)
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
        // Stop further execution without throwing inside the same transaction
        return { balance, transaction, error: "Insufficient funds" };
      }
      balance.availableBalance =
        Number(balance.availableBalance) - Number(transaction.amount);
      balance.withdrawableBalance =
        Number(balance.withdrawableBalance) - Number(transaction.amount);
      transaction.status = "completed";
    }

    transaction.approvedAt = new Date();
    transaction.approvedBy = approvedBy;
    await transaction.save({ transaction: t });

    balance.lastTransactionAt = new Date();
    await balance.save({ transaction: t });

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
