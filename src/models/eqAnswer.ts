import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface EqAnswerAttributes {
  answer: string;
}

export class EqAnswer extends Model<EqAnswerAttributes> implements EqAnswerAttributes {
  public answer!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  EqAnswer.init(
    {
      answer: {
        type: DataTypes.STRING,
        allowNull: false,
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
