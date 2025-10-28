import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
} from "sequelize-typescript";

@Table({
  tableName: "profit",
  timestamps: true, // handles createdAt and updatedAt automatically
})
export class Profit extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Default(0)
  @Column(DataType.DECIMAL(15, 2))
  total_deposits!: number;

  @Default(0)
  @Column(DataType.DECIMAL(15, 2))
  total_withdrawals!: number;

  @Default(0)
  @Column(DataType.DECIMAL(15, 2))
  total_withdrawable_balance!: number;

  @Default(0)
  @Column(DataType.DECIMAL(15, 2))
  total_profit!: number;

  @Default(0)
  @Column(DataType.DECIMAL(15, 2))
  expecting_profit!: number;
}
