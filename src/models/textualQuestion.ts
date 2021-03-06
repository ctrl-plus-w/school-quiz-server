import {
  HasOneCreateAssociationMixin,
  BelongsToSetAssociationMixin,
  Sequelize,
  Optional,
  Model,
  DataTypes,
  BelongsToGetAssociationMixin,
} from 'sequelize';

import { Question } from './question';
import { VerificationType } from './verificationType';
import { QuestionSpecification } from './questionSpecification';

interface TextualQuestionAttributes {
  id: number;
  caseSensitive: boolean;
  accentSensitive: boolean;
}

interface TextualQuestionDataValues extends TextualQuestionAttributes {
  verificationType?: VerificationType;

  questionSpecificationId?: number;
  verificationTypeId?: number;
}

export type TextualQuestionCreationAttributes = Optional<TextualQuestionAttributes, 'id'>;

export class TextualQuestion extends Model<TextualQuestionAttributes, TextualQuestionCreationAttributes> implements TextualQuestionAttributes {
  public id!: number;

  public caseSensitive!: boolean;
  public accentSensitive!: boolean;

  public verificationType?: VerificationType;
  public questionSpecification?: QuestionSpecification;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public questionSpecificationId?: number;
  public verificationTypeId?: number;

  public dataValues!: TextualQuestionDataValues;

  /* Question specification property */
  public getQuestionSpecification!: BelongsToGetAssociationMixin<QuestionSpecification>;
  public setQuestionSpecification!: BelongsToSetAssociationMixin<QuestionSpecification, number>;

  /*  Question verification type property */
  public getVerificationType!: BelongsToGetAssociationMixin<VerificationType>;
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
        afterFind: (instanceOrInstances: TextualQuestion | Array<TextualQuestion>) => {
          if (instanceOrInstances && !('count' in instanceOrInstances)) {
            const arrayedInstances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];
            const instances = instanceOrInstances === null ? [] : arrayedInstances;

            for (const instance of instances) {
              delete instance.verificationTypeId;
              delete instance.dataValues.verificationTypeId;

              delete instance.questionSpecificationId;
              delete instance.dataValues.questionSpecificationId;
            }
          }
        },
      },
    }
  );

  return TextualQuestion;
};
