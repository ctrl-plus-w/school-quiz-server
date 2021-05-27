import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface QuestionTypeAttributes {
  slug: Date;
  name: Date;
}

export class QuestionType extends Model<QuestionTypeAttributes> implements QuestionTypeAttributes {
  public slug!: Date;
  public name!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  QuestionType.init(
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
      modelName: 'questionType',
      tableName: 'QuestionType',
    }
  );

  return QuestionType;
};
