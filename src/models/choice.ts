import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface ChoiceAttributes {
  valid: boolean;
  slug: Date;
  name: Date;
}

export class Choice extends Model<ChoiceAttributes> implements ChoiceAttributes {
  public valid!: boolean;
  public slug!: Date;
  public name!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Choice.init(
    {
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
