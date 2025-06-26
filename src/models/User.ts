import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique, AllowNull, Default, HasOne } from 'sequelize-typescript';
import { Profile } from './Profile';

@Table({
  tableName: 'users',
  timestamps: true, // adds createdAt and updatedAt
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(100))
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  password!: string;

  @AllowNull(false)
  @Column(DataType.STRING(256))
  address!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isAdmin!: boolean;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;

  @HasOne(() => Profile)
  profile!: Profile;
}