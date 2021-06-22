import { Optional, Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface QuestionTypeSpecificationAttributes {
  id: number;
  slug: string;
  name: string;
}

interface QuestionTypeSpecificationCreationAttributes extends Optional<QuestionTypeSpecificationAttributes, 'id'> {}

export class QuestionTypeSpecification
  extends Model<QuestionTypeSpecificationAttributes, QuestionTypeSpecificationCreationAttributes>
  implements QuestionTypeSpecificationAttributes
{
  public id!: number;
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  QuestionTypeSpecification.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'questionTypeSpecification',
      tableName: 'QuestionTypeSpecification',
    }
  );

  return QuestionTypeSpecification;
};
