import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
} from "sequelize-typescript";

@Table({
  tableName: "game",
  timestamps: true, // handles createdAt and updatedAt automatically
  indexes: [{ fields: ["gameStatus"] }, { fields: ["name"] }],
})
export class Game extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description?: string;

  @Default(10.0)
  @Column(DataType.DECIMAL(15, 2))
  minimumBet!: number;

  @Default(10000.0)
  @Column(DataType.DECIMAL(15, 2))
  maximumBet!: number;

  @Default("active")
  @Column(DataType.ENUM("active", "closed", "exclusive"))
  gameStatus!: "active" | "closed" | "exclusive";
}
