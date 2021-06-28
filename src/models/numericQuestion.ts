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

interface NumericQuestionDataValues extends NumericQuestionAttributes {
  questionTypeSpecification?: QuestionTypeSpecification;

  questionTypeSpecificationId?: number;
}

export type NumericQuestionCreationAttributes = Optional<NumericQuestionAttributes, 'id'>;

export class NumericQuestion
  extends Model<NumericQuestionAttributes, NumericQuestionCreationAttributes>
  implements NumericQuestionAttributes
{
  public id!: number;

  public questionTypeSpecification!: QuestionTypeSpecification;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public questionTypeSpecificationId?: number;

  public dataValues!: NumericQuestionDataValues;

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

      hooks: {
        beforeFind: (options) => {
          options.include = [{ model: QuestionTypeSpecification }];
        },

        afterFind: (instanceOrInstances: NumericQuestion | Array<NumericQuestion>) => {
          const arrayedInstances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];
          const instances = instanceOrInstances === null ? [] : arrayedInstances;

          for (const instance of instances) {
            delete instance.questionTypeSpecificationId;
            delete instance.dataValues.questionTypeSpecificationId;
          }
        },
      },
    }
  );

  return NumericQuestion;
};
