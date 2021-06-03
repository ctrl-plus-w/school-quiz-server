import { BelongsToSetAssociationMixin, HasOneCreateAssociationMixin, Optional, Sequelize } from 'sequelize/types';

import { Model } from 'sequelize';
import { Question } from './question';
import { QuestionTypeSpecification } from './questionTypeSpecification';

interface NumericQuestionAttributes {}

export class NumericQuestion extends Model<NumericQuestionAttributes> implements NumericQuestionAttributes {
  public questionTypeSpecification!: QuestionTypeSpecification;

  public setQuestionTypeSpecification!: BelongsToSetAssociationMixin<QuestionTypeSpecification, number>;
  public createQuestion!: HasOneCreateAssociationMixin<Question>;

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
