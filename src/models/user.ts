import {
  Sequelize,
  BelongsToSetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  Optional,
  Model,
  DataTypes,
  BelongsToManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyRemoveAssociationsMixin,
} from 'sequelize';

import { Role } from './role';
import { Event, FormattedEvent } from './event';
import { State } from './state';
import { Group } from './group';
import { FormattedQuiz, Quiz } from './quiz';

interface UserAttributes {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  gender: boolean | null;
}

export interface FormattedUser extends Optional<UserAttributes, 'password'> {
  state?: State;
  role?: Role;
  events?: Array<FormattedEvent>;
  groups?: Array<Group>;
  quizzes?: Array<FormattedQuiz>;

  createdAt: Date;
  updatedAt: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id'>;

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

  public quizzes?: Array<Quiz>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Role properties */
  public getRole!: BelongsToGetAssociationMixin<Role>;
  public setRole!: BelongsToSetAssociationMixin<Role, number>;
  public removeRole!: BelongsToSetAssociationMixin<Role, number>;

  /* Group properties */
  public countGroups!: BelongsToManyCountAssociationsMixin;
  public getGroups!: BelongsToManyGetAssociationsMixin<Group>;
  public addGroup!: BelongsToManyAddAssociationMixin<Group, number>;
  public addGroups!: BelongsToManyAddAssociationsMixin<Group, number>;
  public removeGroup!: BelongsToManyRemoveAssociationMixin<Group, number>;
  public removeGroups!: BelongsToManyRemoveAssociationsMixin<Group, number>;

  /* State property */
  public getState!: BelongsToGetAssociationMixin<State>;
  public setState!: BelongsToSetAssociationMixin<State, number>;

  /* Event properties */
  public getEvents!: BelongsToManyGetAssociationsMixin<Event>;
  public addEvent!: BelongsToManyAddAssociationMixin<Event, number>;
  public addEvents!: BelongsToManyAddAssociationsMixin<Event, number>;
  public createEvent!: BelongsToManyCreateAssociationMixin<Event>;
  public removeEvent!: BelongsToManyRemoveAssociationMixin<Event, number>;

  /* Quiz properties */
  public getQuizzes!: HasManyGetAssociationsMixin<Quiz>;
  public createQuiz!: HasManyCreateAssociationMixin<Quiz>;
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
        allowNull: true,
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
