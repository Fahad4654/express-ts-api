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
  HasMany,
} from "sequelize-typescript";
import { Account } from "./Account";
import { BalanceTransaction } from "./BalanceTransaction";

@Table({
  tableName: "balance",
  timestamps: true, // handles createdAt and updatedAt automatically
  indexes: [{ unique: true, fields: ["accountId"] }],
})
export class Balance extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Account)
  @AllowNull(false)
  @Column(DataType.UUID)
  accountId!: string;

  @BelongsTo(() => Account, { onDelete: "CASCADE" }) // Delete balance if account is deleted
  account!: Account;

  /** Spendable amount */
  @Default(0.0)
  @Column(DataType.DECIMAL(15, 2))
  availableBalance!: number;

  /** Held funds */
  @Default(0.0)
  @Column(DataType.DECIMAL(15, 2))
  holdBalance!: number;

  /** Withdrawable funds */
  @Default(0.0)
  @Column(DataType.DECIMAL(15, 2))
  withdrawableBalance!: number;

  /** Currency */
  @Default("BDT")
  @Column(DataType.STRING(3))
  currency!: string;

  /** Last transaction timestamp */
  @AllowNull(true)
  @Column(DataType.DATE)
  lastTransactionAt!: Date | null;

  /** All transactions related to this balance */
  @HasMany(() => BalanceTransaction)
  transactions!: BalanceTransaction[];
}
