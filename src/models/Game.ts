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
  indexes: [{ fields: ["gameStatus"] }],
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

  @Default(10000.0)
  @Column(DataType.DECIMAL(15, 2))
  maximumBet!: number;

  /** Status */
  @Default("active")
  @Column(DataType.ENUM("active", "closed", "exclusive"))
  gameStatus!: "active" | "closed" | "exclusive";

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}
