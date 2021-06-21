import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';
import { Question } from './question';
import { User } from './user';

interface UserAnswerAttributes {
  answerContent: string;
}

export class UserAnswer extends Model<UserAnswerAttributes> implements UserAnswerAttributes {
  public answerContent!: string;

  public question?: Question;
  public user?: User;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* User property */
  public setUser!: BelongsToSetAssociationMixin<User, number>;
}

export default (sequelize: Sequelize) => {
  UserAnswer.init(
    {
      answerContent: {
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
