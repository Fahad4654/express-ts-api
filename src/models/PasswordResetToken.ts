// models/PasswordResetToken.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "password_reset_tokens",
  timestamps: true,
})
export class PasswordResetToken extends Model {
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @Column(DataType.STRING)
  otp!: string;

  @Column(DataType.DATE)
  expiresAt!: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  verified!: boolean;

  @BelongsTo(() => User)
  user!: User;
}
