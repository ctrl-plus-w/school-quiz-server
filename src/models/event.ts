import {
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToSetAssociationMixin,
  Optional,
  Sequelize,
} from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

import { Group } from './group';
import { User } from './user';
import { Quiz } from './quiz';

interface EventAttributes {
  id: number;
  start: Date;
  countdown: Date;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id'> {}

export class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public start!: Date;
  public countdown!: Date;

  public quiz!: Quiz;
  public group!: Group;
  public collaborators!: Array<User>;
  public owner!: User;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Quiz property */
  public setQuiz!: BelongsToSetAssociationMixin<Quiz, number>;

  /* Group property */
  public setGroup!: BelongsToSetAssociationMixin<Group, number>;

  /* Owner property */
  public setOwner!: BelongsToSetAssociationMixin<User, number>;

  /* Collaborators properties */
  public addCollaborator!: BelongsToManyAddAssociationMixin<User, number>;
  public removeCollaborator!: BelongsToManyRemoveAssociationMixin<User, number>;
}

export default (sequelize: Sequelize) => {
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
