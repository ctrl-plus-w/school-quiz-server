import {
  Sequelize,
  BelongsToSetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  Optional,
  Model,
  DataTypes,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
} from 'sequelize';

import { Role } from './role';
import { Event, FormattedEvent } from './event';
import { Group } from './group';
import { FormattedQuiz, Quiz } from './quiz';
import { UserAnswer } from './userAnswer';
import { EventWarn } from './eventWarn';
import { Analytic } from './analytics';

interface UserAttributes {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  gender: boolean | null;
}

export interface FormattedUser extends Optional<UserAttributes, 'password'> {
  role?: Role;
  events?: Array<FormattedEvent>;
  groups?: Array<Group>;
  quizzes?: Array<FormattedQuiz>;
  warns?: number;

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

  public role?: Role;
  public events?: Array<Event>;
  public groups?: Array<Group>;
  public eventWarn?: EventWarn;

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

  /* Event properties */
  public getOwnedEvents!: HasManyGetAssociationsMixin<Event>;
  public getCollaboratedEvents!: BelongsToManyGetAssociationsMixin<Event>;
  public addEvent!: BelongsToManyAddAssociationMixin<Event, number>;
  public addEvents!: BelongsToManyAddAssociationsMixin<Event, number>;
  public removeEvent!: BelongsToManyRemoveAssociationMixin<Event, number>;

  /* Quiz properties */
  public getOwnedQuizzes!: HasManyGetAssociationsMixin<Quiz>;
  public getCollaboratedQuizzes!: HasManyGetAssociationsMixin<Quiz>;

  /* User Answers */
  public createUserAnswer!: HasManyCreateAssociationMixin<UserAnswer>;

  /* Analytics properties */
  public createAnalytic!: HasManyCreateAssociationMixin<Analytic>;
  public getAnalytics!: HasManyGetAssociationsMixin<Analytic>;
  public addAnalytic!: HasManyAddAssociationMixin<Analytic, number>;
  public addAnalytics!: HasManyAddAssociationsMixin<Analytic, number>;
  public removeAnalytic!: HasManyRemoveAssociationMixin<Analytic, number>;
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
