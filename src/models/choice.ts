import { Optional, Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface ChoiceAttributes {
  id: number;
  valid: boolean;
  slug: string;
  name: string;
}

interface ChoiceCreationAttributes extends Optional<ChoiceAttributes, 'id'> {}

export class Choice extends Model<ChoiceAttributes, ChoiceCreationAttributes> implements ChoiceAttributes {
  public id!: number;
  public valid!: boolean;
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Choice.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      valid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: 'choice',
      tableName: 'Choice',
    }
  );

  return Choice;
};
