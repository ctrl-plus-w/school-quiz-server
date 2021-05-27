import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface EventAttributes {
  start: Date;
  countdown: Date;
}

export class Event extends Model<EventAttributes> implements EventAttributes {
  public start!: Date;
  public countdown!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Event.init(
    {
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
