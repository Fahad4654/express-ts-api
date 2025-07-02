import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Unique,
  PrimaryKey,
  Default,
} from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "profiles",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["userId"],
    },
  ],
})
export class Profile extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    unique: true,
  })
  userId!: string;

  @Column(DataType.STRING(100))
  bio?: string;

  @Column(DataType.STRING(100))
  avatarUrl?: string;

  @AllowNull(true)
  @Column(DataType.STRING(256))
  address?: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  referralCode!: string;

  @Column(DataType.STRING)
  referredCode?: string;

  @BelongsTo(() => User)
  user!: User;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}
