import {
  HasOneCreateAssociationMixin,
  BelongsToSetAssociationMixin,
  Sequelize,
  Optional,
  Model,
  DataTypes,
} from 'sequelize';

import { Question } from './question';
import { VerificationType } from './verificationType';
import { QuestionTypeSpecification } from './questionTypeSpecification';

interface TextualQuestionAttributes {
  id: number;
  caseSensitive: boolean;
  accentSensitive: boolean;
}

type TextualQuestionCreationAttributes = Optional<TextualQuestionAttributes, 'id'>;

export class TextualQuestion
  extends Model<TextualQuestionAttributes, TextualQuestionCreationAttributes>
  implements TextualQuestionAttributes
{
  public id!: number;

  public caseSensitive!: boolean;
  public accentSensitive!: boolean;

  public verificationType!: VerificationType;
  public questionTypeSpecification!: QuestionTypeSpecification;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Question specification property */
  public setQuestionTypeSpecification!: BelongsToSetAssociationMixin<QuestionTypeSpecification, number>;

  /*  Question verification type property */
  public setVerificationType!: BelongsToSetAssociationMixin<VerificationType, number>;

  /* Question property */
  public createQuestion!: HasOneCreateAssociationMixin<Question>;
}

export default (sequelize: Sequelize): typeof TextualQuestion => {
  TextualQuestion.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      caseSensitive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      accentSensitive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'textualQuestion',
      tableName: 'TextualQuestion',
    }
  );

  return TextualQuestion;
};
