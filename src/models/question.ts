import { BelongsToCreateAssociationMixin, Optional, Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

import { TextualQuestion } from './textualQuestion';
import { ChoiceQuestion } from './choiceQuestion';
import { NumericQuestion } from './numericQuestion';
import { QuestionTypeSpecification } from './questionTypeSpecification';
import { VerificationType } from './verificationType';
import { Choice } from './choice';

interface QuestionAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  filename: string;
  questionType: string;
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

  public get typedQuestion(): NumericQuestion | TextualQuestion | ChoiceQuestion | undefined {
    if (this.numericQuestion) return this.numericQuestion;
    if (this.textualQuestion) return this.textualQuestion;
    if (this.choiceQuestion) return this.choiceQuestion;

    return undefined;
  }

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
          ];
        },
      },
    }
  );

  return Question;
};
