import { HasOneCreateAssociationMixin, Optional, Sequelize, Model, DataTypes } from 'sequelize';

import { Answer } from './answer';

interface EqAnswerAttributes {
  id: number;
  answerContent: string;
}

type EqAnswerCreationAttributes = Optional<EqAnswerAttributes, 'id'>

export class EqAnswer extends Model<EqAnswerAttributes, EqAnswerCreationAttributes> implements EqAnswerAttributes {
  public id!: number;
  public answerContent!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Answer property */
  public createAnswer!: HasOneCreateAssociationMixin<Answer>;
}

export default (sequelize: Sequelize): typeof EqAnswer => {
  EqAnswer.init(
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
      modelName: 'eqAnswer',
      tableName: 'EqAnswer',
    }
  );

  return EqAnswer;
};
