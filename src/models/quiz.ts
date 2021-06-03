import {
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationsMixin,
  Optional,
  Sequelize,
} from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';
import { Question } from './question';

interface QuizAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  strict: boolean;
  shuffle: boolean;
}

interface QuizCreationAttributes extends Optional<QuizAttributes, 'id'> {}

export class Quiz extends Model<QuizAttributes, QuizCreationAttributes> implements QuizAttributes {
  public id!: number;
  public slug!: string;
  public title!: string;
  public description!: string;
  public strict!: boolean;
  public shuffle!: boolean;

  public addQuestion!: BelongsToManyAddAssociationMixin<Question, number>;
  public addQuestions!: BelongsToManyAddAssociationsMixin<Question, number>;
  public removeQuestion!: BelongsToManyRemoveAssociationsMixin<Question, number>;

  public questions?: Array<Question>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Quiz.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
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
