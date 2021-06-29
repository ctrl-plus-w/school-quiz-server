import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

interface QuestionSpecificationAttributes {
  id: number;
  slug: string;
  name: string;
}

export type QuestionSpecificationCreationAttributes = Optional<QuestionSpecificationAttributes, 'id'>;

export class QuestionSpecification
  extends Model<QuestionSpecificationAttributes, QuestionSpecificationCreationAttributes>
  implements QuestionSpecificationAttributes
{
  public id!: number;
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize): typeof QuestionSpecification => {
  QuestionSpecification.init(
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
      modelName: 'questionSpecification',
      tableName: 'QuestionSpecification',
    }
  );

  return QuestionSpecification;
};
