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

export interface FormattedQuiz extends QuizAttributes {
  owner?: User;
  questions?: Array<Question>;
  collaborators?: Array<User>;

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

  /* Question properties */
  public getQuestions!: HasManyGetAssociationsMixin<Question>;

  /* User properties */
  private setUser!: BelongsToSetAssociationMixin<User, number>;
  public setOwner = this.setUser;

  private addUser!: BelongsToManyAddAssociationMixin<User, number>;
  public addCollaborator = this.addUser;

  private removeUser!: BelongsToManyRemoveAssociationMixin<User, number>;
  public removeCollaborator = this.removeUser;

  private getUser!: BelongsToGetAssociationMixin<User>;
  public getOwner = this.getUser;

  private getUsers!: BelongsToManyGetAssociationsMixin<User>;
  public getCollaborators = this.getUsers;

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
