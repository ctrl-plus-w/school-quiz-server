import { Model, DataTypes, BelongsToSetAssociationMixin, Optional, Sequelize } from 'sequelize';

import { Question } from './question';
import { FormattedUser, User } from './user';

interface UserAnswerAttributes {
  id: number;
  answerContent: string;
}

export interface FormattedUserAnswer extends UserAnswerAttributes {
  user?: FormattedUser;

  updatedAt: Date;
  createdAt: Date;
}

export type UserAnswerCreationAttributes = Optional<UserAnswerAttributes, 'id'>;

export class UserAnswer
  extends Model<UserAnswerAttributes, UserAnswerCreationAttributes>
  implements UserAnswerAttributes
{
  public id!: number;

  public answerContent!: string;

  public question?: Question;
  public user?: User;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* User property */
  public setUser!: BelongsToSetAssociationMixin<User, number>;

  /* Question property */
  public setQuestion!: BelongsToSetAssociationMixin<Question, number>;
}

export default (sequelize: Sequelize): typeof UserAnswer => {
  UserAnswer.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
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
