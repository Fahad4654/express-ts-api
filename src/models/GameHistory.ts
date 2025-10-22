import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  PrimaryKey,
  Default,
  Index,
  BeforeCreate,
  BeforeUpdate,
  AfterCreate,
  AfterUpdate,
} from "sequelize-typescript";
import { Balance } from "./Balance";
import { Account } from "./Account";
import { User } from "./User";
import { Game } from "./Game";

@Table({
  tableName: "gameHistory",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["accountId"] },
    { fields: ["balanceId"] },
    { fields: ["type"] },
    { fields: ["gameId"] },
    { fields: ["gameName"] },
  ],
})
export class GameHistory extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Balance)
  @AllowNull(false)
  @Column(DataType.UUID)
  balanceId!: string;

  @BelongsTo(() => Balance, { onDelete: "CASCADE" })
  balance!: Balance;

  @ForeignKey(() => Account)
  @AllowNull(false)
  @Column(DataType.UUID)
  accountId!: string;

  @BelongsTo(() => Account, { onDelete: "CASCADE" })
  account!: Account;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ForeignKey(() => Game)
  @AllowNull(false)
  @Column(DataType.UUID)
  gameId!: string;

  @BelongsTo(() => Game, { onDelete: "CASCADE" })
  game!: Game;

  /** Game Name (auto populated from Game model) */
  @AllowNull(true)
  @Column(DataType.STRING)
  gameName!: string;

  /** Transaction type */
  @AllowNull(false)
  @Column(DataType.ENUM("win", "lose"))
  type!: "win" | "lose";

  /** Direction of funds */
  @AllowNull(false)
  @Column(DataType.ENUM("credit", "debit"))
  direction!: "credit" | "debit";

  /** Amount */
  @AllowNull(false)
  @Column(DataType.DECIMAL(15, 2))
  amount!: number;

  /** Currency */
  @Default("BDT")
  @Column(DataType.STRING(3))
  currency!: string;

  /** Description */
  @Column(DataType.STRING)
  description!: string;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;

  /** Hook to auto-fill gameName from Game */
  @BeforeCreate
  @BeforeUpdate
  @AfterCreate
  @AfterUpdate
  static async setGameName(instance: GameHistory) {
    if (instance.gameId) {
      const game = await Game.findByPk(instance.gameId);
      if (game) {
        instance.gameName = game.name;
      }
    }
  }
}
