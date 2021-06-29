import {
  Model,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  Optional,
  Sequelize,
} from 'sequelize';

import { TextualQuestion } from './textualQuestion';
import { ChoiceQuestion } from './choiceQuestion';
import { NumericQuestion } from './numericQuestion';
import { QuestionSpecification } from './questionSpecification';
import { VerificationType } from './verificationType';
import { Choice } from './choice';
import { UserAnswer } from './userAnswer';
import { User } from './user';

export type TypedQuestion = NumericQuestion | TextualQuestion | ChoiceQuestion;

interface QuestionAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  filename?: string;
  questionType: string;
}

export interface FormatedQuestion extends QuestionAttributes {
  typedQuestion: TypedQuestion | undefined;
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionDataValues extends QuestionAttributes {
  textualQuestion?: TextualQuestion;
  numericQuestion?: NumericQuestion;
  choiceQuestion?: ChoiceQuestion;

  typedQuestion?: TypedQuestion;
}

type QuestionCreationAttributes = Optional<QuestionAttributes, 'id' | 'filename' | 'questionType'>;

export class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  public id!: number;
  public slug!: string;
  public title!: string;
  public description!: string;
  public filename!: string;
  public questionType!: string;

  public numericQuestion?: NumericQuestion;
  public textualQuestion?: TextualQuestion;
  public choiceQuestion?: ChoiceQuestion;

  public typedQuestion?: TypedQuestion;
  public typedQuestionId?: number;

  public userAnswers?: Array<UserAnswer>;

  /* Additional property */
  public dataValues!: QuestionDataValues;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* User answer properties */
  public addUserAnswer!: HasManyAddAssociationMixin<UserAnswer, number>;
  public removeUserAnswer!: HasManyRemoveAssociationMixin<UserAnswer, number>;
  public createUserAnswer!: HasManyCreateAssociationMixin<UserAnswer>;
}

export default (sequelize: Sequelize): typeof Question => {
  Question.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      questionType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'question',
      tableName: 'Question',

      hooks: {
        beforeFind: (options) => {
          options.include = [
            {
              model: TextualQuestion,
              include: [VerificationType, QuestionSpecification],
            },
            {
              model: NumericQuestion,
              include: [QuestionSpecification],
            },
            {
              model: ChoiceQuestion,
              include: [QuestionSpecification, Choice],
            },
            {
              model: UserAnswer,
              include: [User],
            },
          ];
        },

        afterFind: (instanceOrInstances: Array<Question> | Question) => {
          const arrayedInstances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];
          const instances = instanceOrInstances === null ? [] : arrayedInstances;

          for (const instance of instances) {
            if (instance.questionType === 'numericQuestion' && instance.typedQuestionId != undefined) {
              instance.typedQuestion = instance.numericQuestion;
            } else if (instance.questionType === 'textualQuestion' && instance.typedQuestionId != undefined) {
              instance.typedQuestion = instance.textualQuestion;
            } else if (instance.questionType === 'choiceQuestion' && instance.typedQuestionId != undefined) {
              instance.typedQuestion = instance.choiceQuestion;
            }

            delete instance.numericQuestion;
            delete instance.dataValues.numericQuestion;

            delete instance.textualQuestion;
            delete instance.dataValues.textualQuestion;

            delete instance.choiceQuestion;
            delete instance.dataValues.choiceQuestion;
          }
        },
      },
    }
  );

  return Question;
};
