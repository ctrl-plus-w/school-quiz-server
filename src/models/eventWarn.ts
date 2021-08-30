import { Sequelize, Model, DataTypes, BelongsToGetAssociationMixin } from 'sequelize';

import { Event } from './event';
import { User } from './user';

interface EventWarnAttributes {
  amount: number;
  eventId: number;
  userId: number;
}

export class EventWarn extends Model<EventWarnAttributes> implements EventWarnAttributes {
  public amount!: number;
  public eventId!: number;
  public userId!: number;

  public getUser!: BelongsToGetAssociationMixin<User>;
  public getEvent!: BelongsToGetAssociationMixin<Event>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize): typeof EventWarn => {
  EventWarn.init(
    {
      amount: {
        type: DataTypes.INTEGER,
      },
      eventId: {
        type: DataTypes.VIRTUAL,
      },
      userId: {
        type: DataTypes.VIRTUAL,
      },
    },
    {
      sequelize,
      modelName: 'eventWarn',
      tableName: 'EventWarn',
    }
  );

  return EventWarn;
};
