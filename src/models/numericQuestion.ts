import {
  BelongsToSetAssociationMixin,
  DataTypes,
  HasOneCreateAssociationMixin,
  Optional,
  Sequelize,
  Model,
  BelongsToGetAssociationMixin,
} from 'sequelize';

import { Question } from './question';
import { QuestionSpecification } from './questionSpecification';

interface NumericQuestionAttributes {
  id: number;
}

interface NumericQuestionDataValues extends NumericQuestionAttributes {
  questionSpecification?: QuestionSpecification;

  questionSpecificationId?: number;
}

export type NumericQuestionCreationAttributes = Optional<NumericQuestionAttributes, 'id'>;

export class NumericQuestion extends Model<NumericQuestionAttributes, NumericQuestionCreationAttributes> implements NumericQuestionAttributes {
  public id!: number;

  public questionSpecification!: QuestionSpecification;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public questionSpecificationId?: number;

  public dataValues!: NumericQuestionDataValues;

  /* Question specification property */
  public getQuestionSpecification!: BelongsToGetAssociationMixin<QuestionSpecification>;
  public setQuestionSpecification!: BelongsToSetAssociationMixin<QuestionSpecification, number>;

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
        afterFind: (instanceOrInstances: NumericQuestion | Array<NumericQuestion>) => {
          if (!('count' in instanceOrInstances)) {
            const arrayedInstances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];
            const instances = instanceOrInstances === null ? [] : arrayedInstances;

            for (const instance of instances) {
              delete instance.questionSpecificationId;
              delete instance.dataValues.questionSpecificationId;
            }
          }
        },
      },
    }
  );

  return NumericQuestion;
};
