// models/Otp.ts
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
  tableName: "otp",
  timestamps: true,
})
export class Otp extends Model {
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @Column(DataType.STRING)
  otp!: string;

  @Column(DataType.DATE)
  expiresAt!: Date;

  @Column(DataType.STRING)
  type!: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  verified!: boolean;

  @BelongsTo(() => User, { onDelete: "CASCADE" }) // If user is deleted → account is deleted
  user!: User;
}
