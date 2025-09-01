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
  HasOne,
} from "sequelize-typescript";
import { User } from "./User";
import { Balance } from "./Balance";

@Table({
  tableName: "account",
  timestamps: true,
  indexes: [
    { unique: true, fields: ["userId"] }, // one account per user
  ],
})
export class Account extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index({ unique: true })
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, { onDelete: "CASCADE" }) // If user is deleted → account is deleted
  user!: User;

  /** Unique account number for display or external references */
  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  accountNumber!: string;

  /** Currency code */
  @Default("BDT")
  @Column(DataType.STRING(3))
  currency!: string;

  /** Type of account */
  @AllowNull(false)
  @Default("wallet")
  @Column(DataType.ENUM("wallet", "bank", "crypto"))
  accountType!: "wallet" | "bank" | "crypto";

  /** Account status */
  @Default("active")
  @Column(DataType.ENUM("active", "frozen", "closed"))
  status!: "active" | "frozen" | "closed";

  @HasOne(() => Balance, { onDelete: "CASCADE" }) // If account is deleted → balance is deleted
  balance!: Balance;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}
