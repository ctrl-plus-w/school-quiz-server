import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

import { EqAnswer } from './eqAnswer';
import { GTLTAnswer } from './gtltAnswer';

type TypedAnswer = EqAnswer | GTLTAnswer;

interface AnswerAttributes {
  id: number;
  answerType: string;
}

export interface FormatedAnswer {
  id: number;
  answerType: string;
  typedAnswer: EqAnswer | GTLTAnswer | undefined;
  createdAt: Date;
  updatedAt: Date;
}

interface AnswerDataValues extends AnswerAttributes {
  eqAnswer?: EqAnswer;
  gtLtAnswer?: GTLTAnswer;

  typedAnswer?: TypedAnswer;
}

type AnswerCreationAttributes = Optional<AnswerAttributes, 'id' | 'answerType'>;

export class Answer extends Model<AnswerAttributes, AnswerCreationAttributes> implements AnswerAttributes {
  public id!: number;
  public answerType!: string;

  public eqAnswer?: EqAnswer;
  public gtLtAnswer?: GTLTAnswer;

  public dataValues!: AnswerDataValues;

  public typedAnswer?: TypedAnswer;
  public typedAnswerId?: number;

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
        beforeFind: (options) => {
          options.include = [EqAnswer, GTLTAnswer];
        },

        afterFind: (instanceOrInstances: Array<Answer> | Answer) => {
          const instances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];

          for (const instance of instances) {
            if (instance.answerType === 'eqAnswer' && instance.typedAnswerId != undefined) {
              instance.typedAnswer = instance.eqAnswer;
            } else if (instance.answerType === 'gtLtAnswer' && instance.typedAnswerId != undefined) {
              instance.typedAnswer = instance.gtLtAnswer;
            }

            delete instance.eqAnswer;
            delete instance.dataValues.eqAnswer;

            delete instance.gtLtAnswer;
            delete instance.dataValues.gtLtAnswer;
          }
        },
      },
    }
  );

  return Answer;
};
