// Profile.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull, Unique } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'profiles',
  timestamps: true,
})
export class Profile extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true, // One-to-one relationship
  })
  userId!: number;

  @Column(DataType.STRING(100))
  bio?: string;

  @Column(DataType.STRING(100))
  avatarUrl?: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(100))
  phoneNumber?: string;

  @BelongsTo(() => User)
  user!: User;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}