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

  public addChoice!: BelongsToManyAddAssociationMixin<Choice, number>;
  public addChoices!: BelongsToManyAddAssociationsMixin<Choice, number>;
  public removeChoice!: BelongsToManyRemoveAssociationMixin<Choice, number>;

  public setQuestionTypeSpecification!: BelongsToSetAssociationMixin<QuestionTypeSpecification, number>;
  public createQuestion!: HasOneCreateAssociationMixin<Question>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
