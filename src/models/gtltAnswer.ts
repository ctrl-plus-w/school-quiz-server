import { HasOneCreateAssociationMixin, Optional, Sequelize, Model, DataTypes } from 'sequelize';

import { Answer } from './answer';

interface GTLTAnswerAttributes {
  id: number;
  greaterThan: number;
  lowerThan: number;
}

type GTLTAnswerCreationAttributes = Optional<GTLTAnswerAttributes, 'id'>;

export class GTLTAnswer
  extends Model<GTLTAnswerAttributes, GTLTAnswerCreationAttributes>
  implements GTLTAnswerAttributes
{
  public id!: number;
  public greaterThan!: number;
  public lowerThan!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Answer property */
  public createAnswer!: HasOneCreateAssociationMixin<Answer>;
}

export default (sequelize: Sequelize): typeof GTLTAnswer => {
  GTLTAnswer.init(
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
      modelName: 'gtLtAnswer',
      tableName: 'GTLTAnswer',
    }
  );

  return GTLTAnswer;
};
