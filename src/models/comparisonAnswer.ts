import { HasOneCreateAssociationMixin, Optional, Sequelize, Model, DataTypes } from 'sequelize';

import { Answer } from './answer';

interface ComparisonAnswerAttributes {
  id: number;
  greaterThan: number;
  lowerThan: number;
}

export type ComparisonAnswerCreationAttributes = Optional<ComparisonAnswerAttributes, 'id'>;

export class ComparisonAnswer
  extends Model<ComparisonAnswerAttributes, ComparisonAnswerCreationAttributes>
  implements ComparisonAnswerAttributes
{
  public id!: number;
  public greaterThan!: number;
  public lowerThan!: number;

  public answer?: Answer;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Answer property */
  public createAnswer!: HasOneCreateAssociationMixin<Answer>;
}

export default (sequelize: Sequelize): typeof ComparisonAnswer => {
  ComparisonAnswer.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
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
      modelName: 'comparisonAnswer',
      tableName: 'ComparisonAnswer',
    }
  );

  return ComparisonAnswer;
};
