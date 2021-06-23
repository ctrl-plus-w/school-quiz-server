import {
  BelongsToSetAssociationMixin,
  DataTypes,
  HasOneCreateAssociationMixin,
  Optional,
  Sequelize,
  Model,
} from 'sequelize';

import { Question } from './question';
import { QuestionTypeSpecification } from './questionTypeSpecification';

interface NumericQuestionAttributes {
  id: number;
}

type NumericQuestionCreationAttributes = Optional<NumericQuestionAttributes, 'id'>;

export class NumericQuestion
  extends Model<NumericQuestionAttributes, NumericQuestionCreationAttributes>
  implements NumericQuestionAttributes
{
  public id!: number;

  public questionTypeSpecification!: QuestionTypeSpecification;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Question specification property */
  public setQuestionTypeSpecification!: BelongsToSetAssociationMixin<QuestionTypeSpecification, number>;

  /* Question property */
  public createQuestion!: HasOneCreateAssociationMixin<Question>;
}

export default (sequelize: Sequelize): typeof NumericQuestion => {
  NumericQuestion.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'numericQuestion',
      tableName: 'NumericQuestion',
    }
  );

  return NumericQuestion;
};
