import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  HasOne,
  HasMany,
  ForeignKey,
  Validate,
  Index,
} from "sequelize-typescript";
import { Profile } from "./Profile";
import { Account } from "./Account";
import { GameHistory } from "./GameHistory";

@Table({
  tableName: "users",
  timestamps: true,
  indexes: [
    { unique: true, fields: ["email"] },
    { unique: true, fields: ["phoneNumber"] },
  ],
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  email!: string;

  @AllowNull(false)
  @Validate({
    isNumeric: {
      msg: "Phone number must contain only digits 0-9",
    },
    len: {
      args: [11, 11],
      msg: "Phone number must be exactly 11 digits, e.g., 017XXXXXXXX",
    },
  })
  @Column(DataType.STRING(11))
  phoneNumber!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  password!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isAdmin!: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isAgent!: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isVerified!: boolean;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.UUID)
  createdBy?: string;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.UUID)
  updatedBy?: string;

  @HasOne(() => Profile, { onDelete: "CASCADE" })
  profile!: Profile;

  @HasOne(() => Account, { onDelete: "CASCADE" })
  account!: Account;

  @HasMany(() => GameHistory, { onDelete: "CASCADE" })
  gameHistory!: GameHistory[];

  @HasOne(() => User, { foreignKey: "createdBy", as: "creator" })
  creator?: User;

  @HasOne(() => User, { foreignKey: "updatedBy", as: "updater" })
  updater?: User;
}
