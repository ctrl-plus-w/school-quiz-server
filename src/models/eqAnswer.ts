import { HasOneCreateAssociationMixin, Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';
import { Answer } from './answer';

interface EqAnswerAttributes {
  answerContent: string;
}

export class EqAnswer extends Model<EqAnswerAttributes> implements EqAnswerAttributes {
  public answerContent!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Answer property */
  public createAnswer!: HasOneCreateAssociationMixin<Answer>;
}

export default (sequelize: Sequelize) => {
  EqAnswer.init(
    {
      answerContent: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'eqAnswer',
      tableName: 'EqAnswer',
    }
  );

  return EqAnswer;
};
