import { Model, DataTypes, BelongsToSetAssociationMixin, Optional, Sequelize } from 'sequelize';

import { Question } from './question';
import { User } from './user';

interface UserAnswerAttributes {
  id: number;
  answerContent: string;
}

interface UserAnswerCreationAttributes extends Optional<UserAnswerAttributes, 'id'> {}

export class UserAnswer extends Model<UserAnswerAttributes, UserAnswerCreationAttributes> implements UserAnswerAttributes {
  public id!: number;

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
