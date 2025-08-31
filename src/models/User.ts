import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Unique,
  AllowNull,
  Default,
  HasOne,
  Validate,
} from "sequelize-typescript";
import { Profile } from "./Profile";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(100))
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  password!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isAdmin!: boolean;

  @AllowNull(false)
  @Unique
  @Validate({
    isNumeric: { msg: "Phone number must contain only digits" },
    len: { args: [11, 11], msg: "Phone number must be exactly 11 digits" },
  })
  @Column(DataType.STRING(11))
  phoneNumber!: string;

  @Column(DataType.STRING)
  createdBy?: string;

  @Column(DataType.STRING)
  updatedBy?: string;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;

  @HasOne(() => Profile)
  profile!: Profile;
}
