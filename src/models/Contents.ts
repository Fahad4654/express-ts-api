import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  AllowNull,
  PrimaryKey,
  Default,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "contents",
  timestamps: true, // handles createdAt and updatedAt automatically
  indexes: [{ fields: ["userId"] }, { fields: ["name"] }],
})
export class Contents extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, { onDelete: "CASCADE" })
  user!: User;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  name?: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  text?: string;

  @Default("normal")
  @Column(DataType.ENUM("profilepicture", "normal", "others"))
  type!: "profilepicture" | "normal" | "others";

  @AllowNull(true)
  @Column(DataType.STRING(100))
  mediaUrl?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  status?: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  exclusive?: boolean;

  @AllowNull(true)
  @Column(DataType.STRING)
  createdBy?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  updatedBy?: string;
}
