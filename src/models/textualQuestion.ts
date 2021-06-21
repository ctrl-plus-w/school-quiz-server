import { HasOneCreateAssociationMixin, BelongsToSetAssociationMixin, Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';
import { Question } from './question';
import { VerificationType } from './verificationType';
import { QuestionTypeSpecification } from './questionTypeSpecification';

interface TextualQuestionAttributes {
  caseSensitive: boolean;
  accentSensitive: boolean;
}

export class TextualQuestion extends Model<TextualQuestionAttributes> implements TextualQuestionAttributes {
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

export default (sequelize: Sequelize) => {
  TextualQuestion.init(
    {
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
