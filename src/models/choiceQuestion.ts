import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface ChoiceQuestionAttributes {
  shuffle: boolean;
}

export class ChoiceQuestion extends Model<ChoiceQuestionAttributes> implements ChoiceQuestionAttributes {
  public shuffle!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  ChoiceQuestion.init(
    {
      shuffle: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'choiceQuestion',
      tableName: 'ChoiceQuestion',
    }
  );

  return ChoiceQuestion;
};
