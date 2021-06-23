import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

interface QuestionTypeSpecificationAttributes {
  id: number;
  slug: string;
  name: string;
}

type QuestionTypeSpecificationCreationAttributes = Optional<QuestionTypeSpecificationAttributes, 'id'>

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

export default (sequelize: Sequelize): typeof QuestionTypeSpecification => {
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
