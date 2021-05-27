import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface EventUserStateAttributes {
  slug: Date;
  name: Date;
}

export class EventUserState extends Model<EventUserStateAttributes> implements EventUserStateAttributes {
  public slug!: Date;
  public name!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  EventUserState.init(
    {
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'eventUserState',
      tableName: 'EventUserState',
    }
  );

  return EventUserState;
};
