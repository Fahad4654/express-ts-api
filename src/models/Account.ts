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
})
export class Account extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index({ unique: true }) // each user can have only one account
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, { onDelete: "CASCADE" })
  user!: User;

  @AllowNull(false)
  @Index({ unique: true })
  @Column(DataType.STRING)
  accountNumber!: string;

  @Default("BDT")
  @Column(DataType.STRING(3))
  currency!: string;

  @AllowNull(false)
  @Default("wallet")
  @Column(DataType.ENUM("wallet", "bank", "crypto"))
  accountType!: "wallet" | "bank" | "crypto";

  @Default("active")
  @Column(DataType.ENUM("active", "frozen", "closed"))
  status!: "active" | "frozen" | "closed";

  @HasOne(() => Balance, { onDelete: "CASCADE" })
  balance!: Balance;
}
