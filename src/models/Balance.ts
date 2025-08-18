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
  Unique,
} from "sequelize-typescript";
import { Account } from "./Account";
import { BalanceTransaction } from "./BalanceTransaction";

@Table({
  tableName: "balance",
  timestamps: true,
})
export class Balance extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Account)
  @AllowNull(false)
  @Unique // One balance per account
  @Column(DataType.UUID)
  accountId!: string;

  @BelongsTo(() => Account, { onDelete: "CASCADE" }) // Cascade delete from Account → Balance
  account!: Account;

  /** Spendable amount */
  @Default(0.0)
  @Column(DataType.DECIMAL(15, 2))
  availableBalance!: number;

  /** Held funds */
  @Default(0.0)
  @Column(DataType.DECIMAL(15, 2))
  holdBalance!: number;

  @Default(0.0)
  @Column(DataType.DECIMAL(15, 2))
  withdrawableBalance!: number;

  /** Currency */
  @Default("BDT")
  @Column(DataType.STRING(3))
  currency!: string;

  /** Last transaction timestamp */
  @Column(DataType.DATE)
  lastTransactionAt!: Date;

  @HasMany(() => BalanceTransaction)
  transactions!: BalanceTransaction[];

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}
