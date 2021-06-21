import {
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToSetAssociationMixin,
  HasOneCreateAssociationMixin,
  Sequelize,
} from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

import { Question } from './question';
import { QuestionTypeSpecification } from './questionTypeSpecification';
import { Choice } from './choice';

interface ChoiceQuestionAttributes {
  shuffle: boolean;
}

export class ChoiceQuestion extends Model<ChoiceQuestionAttributes> implements ChoiceQuestionAttributes {
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

export default (sequelize: Sequelize) => {
  ChoiceQuestion.init(
    {
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
