import {
  Association,
  Sequelize,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  Optional,
} from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

import { Role } from './role';
import { Event } from './event';
import { State } from './state';

interface UserAttributes {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  gender: boolean | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public firstName!: string;
  public lastName!: string;
  public password!: string;
  public gender!: boolean | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getRole!: BelongsToGetAssociationMixin<Role>;
  public setRole!: BelongsToSetAssociationMixin<Role, number>;
  public setState!: BelongsToSetAssociationMixin<State, number>;

  public addEvent!: BelongsToManyAddAssociationMixin<Event, number>;
  public removeEvent!: BelongsToManyRemoveAssociationMixin<Event, number>;

  public state?: State;
  public role?: Role;
  public events?: Array<Event>;

  public static associations: {
    role: Association<User, Role>;
  };
}

export default (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'user',
      tableName: 'User',
    }
  );

  return User;
};
