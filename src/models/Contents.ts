import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  AllowNull,
  PrimaryKey,
  Default,
  Unique,
} from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "contents",
  timestamps: true,
  indexes: [
    {
      fields: ["userId"],
    },
  ],
})
export class Contents extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
  })
  userId!: string;

  @Unique
  @Column(DataType.STRING(100))
  name?: string;

  @Column(DataType.STRING(100))
  text?: string;

  @Default("normal")
  @Column(DataType.ENUM("profilepicture", "normal", "others"))
  type!: "profilepicture" | "normal" | "others";

  @Column(DataType.STRING(100))
  mediaUrl?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  status?: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  exclusive?: boolean;

  @Column(DataType.STRING)
  createdBy?: string;

  @Column(DataType.STRING)
  updatedBy?: string;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}
