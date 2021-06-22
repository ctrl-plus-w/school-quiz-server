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
import { QuestionTypeSpecification } from './questionTypeSpecification';
import { VerificationType } from './verificationType';
import { Choice } from './choice';
import { UserAnswer } from './userAnswer';
import { User } from './user';

type TypedQuestion = NumericQuestion | TextualQuestion | ChoiceQuestion;

interface QuestionAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  filename: string;
  questionType: string;
}

interface QuestionDataValues extends QuestionAttributes {
  textualQuestion?: TextualQuestion;
  numericQuestion?: NumericQuestion;
  choiceQuestion?: ChoiceQuestion;

  typedQuestion?: TypedQuestion;
}

interface QuestionCreationAttributes extends Optional<QuestionAttributes, 'id' | 'filename' | 'questionType'> {}

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

export default (sequelize: Sequelize) => {
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
              include: [VerificationType, QuestionTypeSpecification],
            },
            {
              model: NumericQuestion,
              include: [QuestionTypeSpecification],
            },
            {
              model: ChoiceQuestion,
              include: [QuestionTypeSpecification, Choice],
            },
            {
              model: UserAnswer,
              include: [User],
            },
          ];
        },

        afterFind: (instanceOrInstances: Array<Question> | Question) => {
          const instances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];

          for (let instance of instances) {
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
