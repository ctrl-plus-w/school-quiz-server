import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface EventUserRelationAttributes {
  slug: Date;
  name: Date;
}

export class EventUserRelation extends Model<EventUserRelationAttributes> implements EventUserRelationAttributes {
  public slug!: Date;
  public name!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  EventUserRelation.init(
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
      modelName: 'eventUserRelation',
      tableName: 'EventUserRelation',
    }
  );

  return EventUserRelation;
};
