import {
  HasOneCreateAssociationMixin,
  BelongsToSetAssociationMixin,
  Sequelize,
  Optional,
  Model,
  DataTypes,
} from 'sequelize';

import { Question } from './question';
import { VerificationType } from './verificationType';
import { QuestionTypeSpecification } from './questionTypeSpecification';

interface TextualQuestionAttributes {
  id: number;
  caseSensitive: boolean;
  accentSensitive: boolean;
}

interface TextualQuestionDataValues extends TextualQuestionAttributes {
  verificationType?: VerificationType;

  questionTypeSpecificationId?: number;
  verificationTypeId?: number;
}

export type TextualQuestionCreationAttributes = Optional<TextualQuestionAttributes, 'id'>;

export class TextualQuestion
  extends Model<TextualQuestionAttributes, TextualQuestionCreationAttributes>
  implements TextualQuestionAttributes
{
  public id!: number;

  public caseSensitive!: boolean;
  public accentSensitive!: boolean;

  public verificationType?: VerificationType;
  public questionTypeSpecification?: QuestionTypeSpecification;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public questionTypeSpecificationId?: number;
  public verificationTypeId?: number;

  public dataValues!: TextualQuestionDataValues;

  /* Question specification property */
  public setQuestionTypeSpecification!: BelongsToSetAssociationMixin<QuestionTypeSpecification, number>;

  /*  Question verification type property */
  public setVerificationType!: BelongsToSetAssociationMixin<VerificationType, number>;

  /* Question property */
  public createQuestion!: HasOneCreateAssociationMixin<Question>;
}

export default (sequelize: Sequelize): typeof TextualQuestion => {
  TextualQuestion.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      caseSensitive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      accentSensitive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'textualQuestion',
      tableName: 'TextualQuestion',

      hooks: {
        beforeFind: (options) => {
          options.include = [{ model: VerificationType }, { model: QuestionTypeSpecification }];
        },

        afterFind: (instanceOrInstances: TextualQuestion | Array<TextualQuestion>) => {
          const arrayedInstances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];
          const instances = instanceOrInstances === null ? [] : arrayedInstances;

          for (const instance of instances) {
            delete instance.verificationTypeId;
            delete instance.dataValues.verificationTypeId;

            delete instance.questionTypeSpecificationId;
            delete instance.dataValues.questionTypeSpecificationId;
          }
        },
      },
    }
  );

  return TextualQuestion;
};
