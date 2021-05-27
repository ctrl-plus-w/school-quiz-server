import { Sequelize } from 'sequelize/types';

import { Model } from 'sequelize';

interface NumericQuestionAttributes {}

export class NumericQuestion extends Model<NumericQuestionAttributes> implements NumericQuestionAttributes {
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  NumericQuestion.init(
    {},
    {
      sequelize,
      modelName: 'numericQuestion',
      tableName: 'NumericQuestion',
    }
  );

  return NumericQuestion;
};
