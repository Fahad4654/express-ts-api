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
  Unique,
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

  /** Transaction type */
  @AllowNull(false)
  @Column(
    DataType.ENUM("deposit", "withdrawal", "payment", "refund", "adjustment")
  )
  type!: "deposit" | "withdrawal" | "payment" | "refund" | "adjustment";

  /** Direction of funds */
  @AllowNull(false)
  @Column(DataType.ENUM("credit", "debit"))
  direction!: "credit" | "debit";

  /** Amount */
  @AllowNull(false)
  @Column(DataType.DECIMAL(15, 2))
  amount!: number;

  /** Currency */
  @Default("BDT")
  @Column(DataType.STRING(3))
  currency!: string;

  /** Description */
  @Column(DataType.STRING)
  description!: string;

  /** Reference ID (unique for deposit only) */
  @Column(DataType.STRING)
  trxId?: string | null;

  /** Withdrawal details */
  @Column(DataType.STRING)
  bkashNo?: string;

  @Column(DataType.STRING)
  accountNo?: string;

  @Column(DataType.STRING)
  branch?: string;

  @Column(DataType.STRING)
  bankName?: string;

  /** Status */
  @Default("pending")
  @Column(DataType.ENUM("pending", "completed", "failed"))
  status!: "pending" | "completed" | "failed";

  /** Admin who approved */
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  approvedBy?: string;

  @BelongsTo(() => User, { as: "approver", foreignKey: "approvedBy" })
  approver?: User;

  /** Approval timestamp */
  @Column(DataType.DATE)
  approvedAt?: Date;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;

  /** Validation rules before saving */
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

      // trxId optional for withdrawal
      instance.trxId = instance.trxId || null;
    }

    if (instance.type === "deposit") {
      if (!instance.trxId) {
        throw new Error("Deposit must include a unique trxId.");
      }

      // Check uniqueness for deposits
      const existing = await BalanceTransaction.findOne({
        where: { trxId: instance.trxId, type: "deposit" },
      });
      if (existing && existing.id !== instance.id) {
        throw new Error("trxId must be unique for deposits.");
      }
    }
  }
}
