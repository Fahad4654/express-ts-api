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
  Index,
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

  /** Reference to external payment/order */
  @Column(DataType.STRING)
  referenceId!: string;

  /** Status */
  @Default("pending")
  @Column(DataType.ENUM("pending", "completed", "failed"))
  status!: "pending" | "completed" | "failed";

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}
