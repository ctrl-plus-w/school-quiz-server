import {
  Sequelize,
  BelongsToSetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  Optional,
  Model,
  DataTypes,
  BelongsToManyAddAssociationsMixin,
} from 'sequelize';

import { Role } from './role';
import { Event } from './event';
import { State } from './state';
import { Group } from './group';

interface UserAttributes {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  gender: boolean | null;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public firstName!: string;
  public lastName!: string;
  public password!: string;
  public gender!: boolean | null;

  public state?: State;
  public role?: Role;
  public events?: Array<Event>;
  public groups?: Array<Group>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Role properties */
  public setRole!: BelongsToSetAssociationMixin<Role, number>;
  public removeRole!: BelongsToSetAssociationMixin<Role, number>;

  /* Group properties */
  public addGroup!: BelongsToManyAddAssociationMixin<Group, number>;
  public addGroups!: BelongsToManyAddAssociationsMixin<Group, number>;
  public removeGroup!: BelongsToManyRemoveAssociationMixin<Group, number>;

  /* State property */
  public setState!: BelongsToSetAssociationMixin<State, number>;

  /* Event properties */
  public addEvent!: BelongsToManyAddAssociationMixin<Event, number>;
  public addEvents!: BelongsToManyAddAssociationsMixin<Event, number>;
  public removeEvent!: BelongsToManyRemoveAssociationMixin<Event, number>;
}

export default (sequelize: Sequelize): typeof User => {
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
