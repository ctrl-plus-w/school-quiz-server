import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

interface StateAttributes {
  id: number;
  slug: string;
  name: string;
}

export type StateCreationAttributes = Optional<StateAttributes, 'id'>;

export class State extends Model<StateAttributes, StateCreationAttributes> implements StateAttributes {
  public id!: number;
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize): typeof State => {
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
