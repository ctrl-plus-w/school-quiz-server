import {
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToSetAssociationMixin,
  Optional,
  Sequelize,
  Model,
  DataTypes,
  HasOneGetAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
} from 'sequelize';

import { Group } from './group';
import { FormattedUser, User } from './user';
import { Quiz } from './quiz';

interface EventAttributes {
  id: number;
  start: Date;
  end: Date;
  countdown: Date;
}

export interface FormattedEvent extends EventAttributes {
  owner?: FormattedUser;
  collaborators?: Array<FormattedUser>;
  quiz?: Quiz;
  group?: Group;

  createdAt: Date;
  updatedAt: Date;
}

export type EventCreationAttributes = Optional<EventAttributes, 'id'>;

export class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public start!: Date;
  public end!: Date;
  public countdown!: Date;

  public quiz?: Quiz;
  public group?: Group;

  private userId?: number;

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
  private getUser!: HasOneGetAssociationMixin<User>;
  public getOwner = this.getUser;

  private setUser!: BelongsToSetAssociationMixin<User, number>;
  public setOwner = this.setUser;

  /* Collaborators properties */
  private getUsers!: BelongsToManyGetAssociationsMixin<User>;
  public getCollaborators = this.getUsers;

  private addUser!: BelongsToManyAddAssociationMixin<User, number>;
  public addCollaborator = this.addUser;

  private removeUser!: BelongsToManyRemoveAssociationMixin<User, number>;
  public removeCollaborator = this.removeUser;
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
    },
    {
      sequelize,
      modelName: 'event',
      tableName: 'Event',
    }
  );

  return Event;
};
