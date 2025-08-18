import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
} from "sequelize-typescript";

@Table({
  tableName: "game",
  timestamps: true,
  indexes: [{ fields: ["status"] }],
})
export class Game extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @Column(DataType.STRING)
  name!: string;

  /** Description */
  @Column(DataType.STRING)
  description!: string;

  @Default(10.0)
  @Column(DataType.DECIMAL(15, 2))
  minimumBet!: number;

  /** Status */
  @Default("pending")
  @Column(DataType.ENUM("active", "closed", "exclusive"))
  status!: "active" | "closed" | "exclusive";

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}
