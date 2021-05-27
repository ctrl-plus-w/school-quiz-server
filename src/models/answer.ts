import { Sequelize } from 'sequelize/types';

import { Model } from 'sequelize';

interface QuestionTypeAttributes {}

export class QuestionType extends Model<QuestionTypeAttributes> implements QuestionTypeAttributes {
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  QuestionType.init(
    {},
    {
      sequelize,
      modelName: 'answer',
      tableName: 'Answer',
    }
  );

  return QuestionType;
};
