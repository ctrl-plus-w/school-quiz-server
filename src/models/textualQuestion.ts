import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface TextualQuestionAttributes {
  caseSensitive: boolean;
  accentSensitive: boolean;
}

export class TextualQuestion extends Model<TextualQuestionAttributes> implements TextualQuestionAttributes {
  public caseSensitive!: boolean;
  public accentSensitive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
