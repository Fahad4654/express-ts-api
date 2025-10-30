import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  PrimaryKey,
  Default,
  BeforeValidate,
} from "sequelize-typescript";
import { Balance } from "./Balance";
import { Account } from "./Account";
import { User } from "./User";

@Table({
  tableName: "balance_transaction",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["accountId"] },
    { fields: ["balanceId"] },
    { fields: ["type"] },
    { fields: ["status"] },
  ],
})
export class BalanceTransaction extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Balance)
  @AllowNull(false)
  @Column(DataType.UUID)
  balanceId!: string;

  @BelongsTo(() => Balance, { onDelete: "CASCADE" })
  balance!: Balance;

  @ForeignKey(() => Account)
  @AllowNull(false)
  @Column(DataType.UUID)
  accountId!: string;

  @BelongsTo(() => Account, { onDelete: "CASCADE" })
  account!: Account;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, { onDelete: "CASCADE" })
  user!: User;

  /** ✅ Every transaction must have a creator */
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  createdBy!: string;

  @BelongsTo(() => User, {
    as: "creator",
    foreignKey: "createdBy",
    onDelete: "RESTRICT",
  })
  creator!: User;

  @AllowNull(false)
  @Column(
    DataType.ENUM("deposit", "withdrawal", "payment", "refund", "adjustment")
  )
  type!: "deposit" | "withdrawal" | "payment" | "refund" | "adjustment";

  @AllowNull(false)
  @Column(DataType.ENUM("credit", "debit"))
  direction!: "credit" | "debit";

  @AllowNull(false)
  @Column(DataType.DECIMAL(15, 2))
  amount!: number;

  @Default("BDT")
  @Column(DataType.STRING(3))
  currency!: string;

  @Column(DataType.STRING)
  description!: string;

  @Column(DataType.STRING)
  trxId?: string | null;

  @Column(DataType.STRING)
  bkashNo?: string;

  @Column(DataType.STRING)
  accountNo?: string;

  @Column(DataType.STRING)
  branch?: string;

  @Column(DataType.STRING)
  bankName?: string;

  @Default("pending")
  @Column(DataType.ENUM("pending", "completed", "failed"))
  status!: "pending" | "completed" | "failed";

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  approvedBy?: string;

  @BelongsTo(() => User, { as: "approver", foreignKey: "approvedBy" })
  approver?: User;

  @Column(DataType.DATE)
  approvedAt?: Date;

  /** Validate withdrawals and deposits */
  @BeforeValidate
  static async validateTransaction(instance: BalanceTransaction) {
    if (instance.type === "withdrawal") {
      const hasBkash = !!instance.bkashNo;
      const hasAccount = !!instance.accountNo;

      if (!hasBkash && !hasAccount) {
        throw new Error("Withdrawal must include either bkashNo or accountNo.");
      }

      if (hasAccount) {
        if (!instance.branch || !instance.bankName) {
          throw new Error(
            "When withdrawal uses accountNo, both branch and bankName are required."
          );
        }
      }

      instance.trxId = instance.trxId || null;
    }

    if (instance.type === "deposit") {
      if (!instance.trxId) {
        throw new Error("Deposit must include a unique trxId.");
      }

      const existing = await BalanceTransaction.findOne({
        where: { trxId: instance.trxId, type: "deposit" },
      });
      if (existing && existing.id !== instance.id) {
        throw new Error("trxId must be unique for deposits.");
      }
    }
  }
}
