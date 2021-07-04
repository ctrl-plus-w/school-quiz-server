import { HasOneCreateAssociationMixin, Optional, Sequelize, Model, DataTypes } from 'sequelize';

import { Answer } from './answer';

interface ExactAnswerAttributes {
  id: number;
  answerContent: string;
}

export type ExactAnswerCreationAttributes = Optional<ExactAnswerAttributes, 'id'>;

export class ExactAnswer
  extends Model<ExactAnswerAttributes, ExactAnswerCreationAttributes>
  implements ExactAnswerAttributes
{
  public id!: number;
  public answerContent!: string;

  public answer?: Answer;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Answer property */
  public createAnswer!: HasOneCreateAssociationMixin<Answer>;
}

export default (sequelize: Sequelize): typeof ExactAnswer => {
  ExactAnswer.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      answerContent: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'exactAnswer',
      tableName: 'ExactAnswer',
    }
  );

  return ExactAnswer;
};
