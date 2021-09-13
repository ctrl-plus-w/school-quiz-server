import {
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToSetAssociationMixin,
  Optional,
  Sequelize,
  Model,
  DataTypes,
  BelongsToManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyAddAssociationsMixin,
} from 'sequelize';

import { FormattedUser, User } from './user';
import { Analytic } from './analytics';
import { Group } from './group';
import { Quiz } from './quiz';

interface EventAttributes {
  id: number;
  start: Date;
  end: Date;
  countdown: Date;
  started: boolean;
  startedAt: Date;
  groupId?: number;
}

export interface FormattedEvent extends EventAttributes {
  owner?: FormattedUser;
  collaborators?: Array<FormattedUser>;
  quiz?: Quiz;
  group?: Group;
  analytics?: Array<Analytic>;

  createdAt: Date;
  updatedAt: Date;
}

export type EventCreationAttributes = Optional<EventAttributes, 'id' | 'started' | 'startedAt'>;

export class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public start!: Date;
  public end!: Date;
  public countdown!: Date;
  public started!: boolean;
  public startedAt!: Date;

  public warnedUsers?: User[];

  public quiz?: Quiz;
  public group?: Group;

  public analytics?: Array<Analytic>;

  private userId?: number;
  public groupId?: number;

  public get ownerId(): number | undefined {
    return this.userId;
  }

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Quiz property */
  public getQuiz!: BelongsToGetAssociationMixin<Quiz>;
  public setQuiz!: BelongsToSetAssociationMixin<Quiz, number>;

  /* Group property */
  public getGroup!: BelongsToGetAssociationMixin<Group>;
  public setGroup!: BelongsToSetAssociationMixin<Group, number>;

  /* Owner property */
  public getOwner!: BelongsToGetAssociationMixin<User>;
  public setOwner!: BelongsToSetAssociationMixin<User, number>;

  /* Collaborators properties */
  public getCollaborators!: BelongsToManyGetAssociationsMixin<User>;
  public countCollaborators!: BelongsToManyCountAssociationsMixin;
  public addCollaborator!: BelongsToManyAddAssociationMixin<User, number>;
  public addCollaborators!: BelongsToManyAddAssociationsMixin<User, number>;
  public removeCollaborator!: BelongsToManyRemoveAssociationMixin<User, number>;

  /* Punished users properties */
  public getWarnedUsers!: BelongsToManyGetAssociationsMixin<User>;
  public countWarnedUsers!: BelongsToManyCountAssociationsMixin;
  public addWarnedUser!: BelongsToManyAddAssociationMixin<User, number>;
  public addWarnedUsers!: BelongsToManyAddAssociationsMixin<User, number>;
  public removeWarnedUser!: BelongsToManyRemoveAssociationMixin<User, number>;
}

export default (sequelize: Sequelize): typeof Event => {
  Event.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      countdown: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      started: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'event',
      tableName: 'Event',
    }
  );

  return Event;
};
