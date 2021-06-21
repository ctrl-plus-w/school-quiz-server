import { HasOneCreateAssociationMixin, Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';
import { Answer } from './answer';

interface GTLTAnswerAttributes {
  greaterThan: number;
  lowerThan: number;
}

export class GTLTAnswer extends Model<GTLTAnswerAttributes> implements GTLTAnswerAttributes {
  public greaterThan!: number;
  public lowerThan!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Answer property */
  public createAnswer!: HasOneCreateAssociationMixin<Answer>;
}

export default (sequelize: Sequelize) => {
  GTLTAnswer.init(
    {
      greaterThan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lowerThan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'gtLtAnswer',
      tableName: 'GTLTAnswer',
    }
  );

  return GTLTAnswer;
};
