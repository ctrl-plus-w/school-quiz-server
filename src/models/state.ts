import { Optional, Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface StateAttributes {
  id: number;
  slug: string;
  name: string;
}

interface StateCreationAttributes extends Optional<StateAttributes, 'id'> {}

export class State extends Model<StateAttributes, StateCreationAttributes> implements StateAttributes {
  public id!: number;
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  State.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
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
      modelName: 'state',
      tableName: 'State',
    }
  );

  return State;
};
