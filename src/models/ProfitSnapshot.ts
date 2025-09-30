// src/models/ProfitSnapshot.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
} from "sequelize-typescript";

@Table({
  tableName: "profit_snapshots",
  timestamps: true, // createdAt = snapshot time
})
export class ProfitSnapshot extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.DECIMAL(15, 2))
  total_deposits!: number;

  @Column(DataType.DECIMAL(15, 2))
  total_withdrawals!: number;

  @Column(DataType.DECIMAL(15, 2))
  total_withdrawable_balance!: number;

  @Column(DataType.DECIMAL(15, 2))
  total_profit!: number;

  @Column(DataType.DECIMAL(15, 2))
  expecting_profit!: number;
}
