import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface QuestionAttributes {
  slug: string;
  title: string;
  description: string;
  filename: string;
}

export class Question extends Model<QuestionAttributes> implements QuestionAttributes {
  public slug!: string;
  public title!: string;
  public description!: string;
  public filename!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Question.init(
    {
      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'question',
      tableName: 'Question',
    }
  );

  return Question;
};
