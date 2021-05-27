import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface AnswerTypeAttributes {
  slug: Date;
  name: Date;
}

export class AnswerType extends Model<AnswerTypeAttributes> implements AnswerTypeAttributes {
  public slug!: Date;
  public name!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  AnswerType.init(
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
      modelName: 'answerType',
      tableName: 'AnswerType',
    }
  );

  return AnswerType;
};
