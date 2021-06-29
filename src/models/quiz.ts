import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,
} from 'sequelize';

import { Question } from './question';
import { User } from './user';

interface QuizAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  strict: boolean;
  shuffle: boolean;
}

export interface FormatedQuiz extends QuizAttributes {
  owner?: User;
  questions?: Array<Question>;

  createdAt: Date;
  updatedAt: Date;
}

export type QuizCreationAttributes = Optional<QuizAttributes, 'id'>;

export class Quiz extends Model<QuizAttributes, QuizCreationAttributes> implements QuizAttributes {
  public id!: number;
  public slug!: string;
  public title!: string;
  public description!: string;
  public strict!: boolean;
  public shuffle!: boolean;

  private user?: User;
  private userId?: number;

  public questions?: Array<Question>;

  public get ownerId(): number | undefined {
    return this.userId;
  }

  public get owner(): User | undefined {
    return this.user;
  }

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Question properties */
  public addQuestion!: HasManyAddAssociationMixin<Question, number>;
  public addQuestions!: HasManyAddAssociationsMixin<Question, number>;
  public createQuestion!: HasManyCreateAssociationMixin<Question>;
  public removeQuestion!: HasManyRemoveAssociationsMixin<Question, number>;
}

export default (sequelize: Sequelize): typeof Quiz => {
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
