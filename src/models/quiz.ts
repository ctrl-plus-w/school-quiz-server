import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  HasManyGetAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  HasManyCountAssociationsMixin,
} from 'sequelize';

import { FormattedQuestion, Question } from './question';
import { FormattedUser, User } from './user';

interface QuizAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  strict: boolean;
  shuffle: boolean;
}

export interface FormattedQuiz extends QuizAttributes {
  owner?: FormattedUser;
  questions?: Array<FormattedQuestion>;
  collaborators?: Array<FormattedUser>;

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

  private userId?: number;

  public get ownerId(): number | undefined {
    return this.userId;
  }

  public questions?: Array<Question>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Owner properties */
  public getOwner!: BelongsToGetAssociationMixin<User>;
  public setOwner!: BelongsToSetAssociationMixin<User, number>;

  /* Collaborators properties */
  public getCollaborators!: BelongsToManyGetAssociationsMixin<User>;
  public countCollaborators!: BelongsToManyCountAssociationsMixin;
  public addCollaborator!: BelongsToManyAddAssociationMixin<User, number>;
  public removeCollaborator!: BelongsToManyRemoveAssociationMixin<User, number>;

  /* Question properties */
  public getQuestions!: HasManyGetAssociationsMixin<Question>;
  public countQuestions!: HasManyCountAssociationsMixin;
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
      name: {
        singular: 'quiz',
        plural: 'quizzes',
      },
    }
  );

  return Quiz;
};
