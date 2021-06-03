import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface QuestionTypeSpecificationAttributes {
  slug: string;
  name: string;
}

export class QuestionTypeSpecification extends Model<QuestionTypeSpecificationAttributes> implements QuestionTypeSpecificationAttributes {
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  QuestionTypeSpecification.init(
    {
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
