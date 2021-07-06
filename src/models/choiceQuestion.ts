import {
  BelongsToSetAssociationMixin,
  HasOneCreateAssociationMixin,
  Optional,
  Sequelize,
  Model,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyCreateAssociationMixin,
} from 'sequelize';

import { Question } from './question';
import { QuestionSpecification } from './questionSpecification';
import { Choice } from './choice';

interface ChoiceQuestionAttributes {
  id: number;
  shuffle: boolean;
}

interface ChoiceQuestionDataValues extends ChoiceQuestionAttributes {
  questionSpecification?: QuestionSpecification;

  questionSpecificationId?: number;
}

export type ChoiceQuestionCreationAttributes = Optional<ChoiceQuestionAttributes, 'id'>;

export class ChoiceQuestion
  extends Model<ChoiceQuestionAttributes, ChoiceQuestionCreationAttributes>
  implements ChoiceQuestionAttributes
{
  public id!: number;
  public shuffle!: boolean;

  public choices?: Array<Choice>;
  public questionSpecification?: QuestionSpecification;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public questionSpecificationId?: number;

  public dataValues!: ChoiceQuestionDataValues;

  /* Choice properties */
  public addChoice!: HasManyAddAssociationMixin<Choice, number>;
  public addChoices!: HasManyAddAssociationsMixin<Choice, number>;
  public createChoice!: HasManyCreateAssociationMixin<Choice>;
  public removeChoice!: HasManyRemoveAssociationMixin<Choice, number>;

  /* Question specification property */
  public setQuestionSpecification!: BelongsToSetAssociationMixin<QuestionSpecification, number>;

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

      hooks: {
        afterFind: (instanceOrInstances: ChoiceQuestion | Array<ChoiceQuestion>) => {
          const arrayedInstances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];
          const instances = instanceOrInstances === null ? [] : arrayedInstances;

          for (const instance of instances) {
            delete instance.questionSpecificationId;
            delete instance.dataValues.questionSpecificationId;
          }
        },
      },
    }
  );

  return ChoiceQuestion;
};
