import {
  Model,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  Optional,
  Sequelize,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
} from 'sequelize';

import { TextualQuestion } from './textualQuestion';
import { ChoiceQuestion } from './choiceQuestion';
import { NumericQuestion } from './numericQuestion';
import { FormattedUserAnswer, UserAnswer } from './userAnswer';
import { Answer, FormattedAnswer } from './answer';

export type TypedQuestion = NumericQuestion | TextualQuestion | ChoiceQuestion;

interface QuestionAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  filename?: string;
  questionType: 'numericQuestion' | 'textualQuestion' | 'choiceQuestion';
}

export interface FormattedQuestion extends QuestionAttributes {
  typedQuestion: TypedQuestion | undefined;
  answers?: Array<FormattedAnswer>;
  userAnswers?: Array<FormattedUserAnswer>;

  shuffle?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

interface QuestionDataValues extends QuestionAttributes {
  textualQuestion?: TextualQuestion;
  numericQuestion?: NumericQuestion;
  choiceQuestion?: ChoiceQuestion;

  typedQuestion?: TypedQuestion;
}

export type QuestionCreationAttributes = Optional<QuestionAttributes, 'id' | 'filename' | 'questionType'>;

export class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  public id!: number;
  public slug!: string;
  public title!: string;
  public description!: string;
  public filename!: string;
  public questionType!: 'numericQuestion' | 'textualQuestion' | 'choiceQuestion';

  public numericQuestion?: NumericQuestion;
  public textualQuestion?: TextualQuestion;
  public choiceQuestion?: ChoiceQuestion;

  public typedQuestion?: TypedQuestion;
  public typedQuestionId?: number;

  public answers?: Array<Answer>;
  public userAnswers?: Array<UserAnswer>;

  /* Additional property */
  public dataValues!: QuestionDataValues;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Answer properties */
  public getAnswers!: BelongsToManyGetAssociationsMixin<Answer>;
  public addAnswer!: BelongsToManyAddAssociationMixin<Answer, number>;
  public removeAnswer!: BelongsToManyRemoveAssociationMixin<Answer, number>;
  public createAnswer!: BelongsToManyCreateAssociationMixin<Answer>;

  /* User answer properties */
  public addUserAnswer!: HasManyAddAssociationMixin<UserAnswer, number>;
  public removeUserAnswer!: HasManyRemoveAssociationMixin<UserAnswer, number>;
  public createUserAnswer!: HasManyCreateAssociationMixin<UserAnswer>;

  /* Typed question properties */
  public getTextualQuestion!: BelongsToGetAssociationMixin<TextualQuestion>;
  public getNumericQuestion!: BelongsToGetAssociationMixin<NumericQuestion>;
  public getChoiceQuestion!: BelongsToGetAssociationMixin<ChoiceQuestion>;
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
        afterFind: (instanceOrInstances: Array<Question> | Question) => {
          if (!('count' in instanceOrInstances)) {
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
          }
        },
      },
    }
  );

  return Question;
};
