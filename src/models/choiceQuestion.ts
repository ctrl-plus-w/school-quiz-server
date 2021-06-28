import {
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToSetAssociationMixin,
  HasOneCreateAssociationMixin,
  Optional,
  Sequelize,
  Model,
  DataTypes,
} from 'sequelize';

import { Question } from './question';
import { QuestionTypeSpecification } from './questionTypeSpecification';
import { Choice } from './choice';

interface ChoiceQuestionAttributes {
  id: number;
  shuffle: boolean;
}

export type ChoiceQuestionCreationAttributes = Optional<ChoiceQuestionAttributes, 'id'>;

export class ChoiceQuestion
  extends Model<ChoiceQuestionAttributes, ChoiceQuestionCreationAttributes>
  implements ChoiceQuestionAttributes
{
  public id!: number;
  public shuffle!: boolean;

  public choices!: Array<Choice>;
  public questionTypeSpecification!: QuestionTypeSpecification;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Choice properties */
  public addChoice!: BelongsToManyAddAssociationMixin<Choice, number>;
  public addChoices!: BelongsToManyAddAssociationsMixin<Choice, number>;
  public removeChoice!: BelongsToManyRemoveAssociationMixin<Choice, number>;

  /* Question specification property */
  public setQuestionTypeSpecification!: BelongsToSetAssociationMixin<QuestionTypeSpecification, number>;

  /* Question property */
  public createQuestion!: HasOneCreateAssociationMixin<Question>;
}

export default (sequelize: Sequelize): typeof ChoiceQuestion => {
  ChoiceQuestion.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      shuffle: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'choiceQuestion',
      tableName: 'ChoiceQuestion',
    }
  );

  return ChoiceQuestion;
};
