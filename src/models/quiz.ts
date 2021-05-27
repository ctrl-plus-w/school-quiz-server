import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface QuizAttributes {
  slug: string;
  title: string;
  description: string;
  strict: boolean;
  shuffle: boolean;
}

export class Quiz extends Model<QuizAttributes> implements QuizAttributes {
  public slug!: string;
  public title!: string;
  public description!: string;
  public strict!: boolean;
  public shuffle!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Quiz.init(
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
      strict: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      shuffle: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'quiz',
      tableName: 'Quiz',
    }
  );

  return Quiz;
};
