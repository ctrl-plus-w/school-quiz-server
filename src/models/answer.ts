import { Model, DataTypes, Optional, Sequelize, BelongsToGetAssociationMixin } from 'sequelize';

import { ExactAnswer } from './exactAnswer';
import { ComparisonAnswer } from './comparisonAnswer';

export type TypedAnswer = ExactAnswer | ComparisonAnswer;

interface AnswerAttributes {
  id: number;
  answerType: 'exactAnswer' | 'comparisonAnswer';
}

export interface FormattedAnswer extends AnswerAttributes {
  typedAnswer: ExactAnswer | ComparisonAnswer | undefined;
  createdAt: Date;
  updatedAt: Date;
}

interface AnswerDataValues extends AnswerAttributes {
  exactAnswer?: ExactAnswer;
  comparisonAnswer?: ComparisonAnswer;

  typedAnswer?: TypedAnswer;
}

type AnswerCreationAttributes = Optional<AnswerAttributes, 'id' | 'answerType'>;

export class Answer extends Model<AnswerAttributes, AnswerCreationAttributes> implements AnswerAttributes {
  public id!: number;
  public answerType!: 'exactAnswer' | 'comparisonAnswer';

  public exactAnswer?: ExactAnswer;
  public comparisonAnswer?: ComparisonAnswer;

  public dataValues!: AnswerDataValues;

  public typedAnswer?: TypedAnswer;
  public typedAnswerId?: number;

  /* Typed answer properties */
  public getExactAnswer!: BelongsToGetAssociationMixin<ExactAnswer>;
  public getComparisonAnswer!: BelongsToGetAssociationMixin<ComparisonAnswer>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize): typeof Answer => {
  Answer.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      answerType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'answer',
      tableName: 'Answer',

      hooks: {
        afterFind: (instanceOrInstances: Array<Answer> | Answer) => {
          const instances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];

          for (const instance of instances) {
            if (instance.answerType === 'exactAnswer' && instance.typedAnswerId != undefined) {
              instance.typedAnswer = instance.exactAnswer;
            } else if (instance.answerType === 'comparisonAnswer' && instance.typedAnswerId != undefined) {
              instance.typedAnswer = instance.comparisonAnswer;
            }

            delete instance.exactAnswer;
            delete instance.dataValues.exactAnswer;

            delete instance.comparisonAnswer;
            delete instance.dataValues.comparisonAnswer;
          }
        },
      },
    }
  );

  return Answer;
};
