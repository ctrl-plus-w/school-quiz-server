import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface UserAnswerAttributes {
  answer: string;
}

export class UserAnswer extends Model<UserAnswerAttributes> implements UserAnswerAttributes {
  public answer!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  UserAnswer.init(
    {
      answer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'userAnswer',
      tableName: 'UserAnswer',
    }
  );

  return UserAnswer;
};
