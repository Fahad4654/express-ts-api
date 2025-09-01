import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
} from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "tokens",
  timestamps: true,
})
export class Token extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.TEXT)
  token!: string;

  @Column(DataType.BOOLEAN)
  isRefreshToken!: boolean;

  @Column(DataType.DATE)
  expiresAt!: Date;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, { onDelete: "CASCADE" })
  user!: User;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}
