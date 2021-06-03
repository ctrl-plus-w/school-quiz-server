import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface VerificationTypeAttributes {
  slug: string;
  name: string;
}

export class VerificationType extends Model<VerificationTypeAttributes> implements VerificationTypeAttributes {
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  VerificationType.init(
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
      modelName: 'verificationType',
      tableName: 'VerificationType',
    }
  );

  return VerificationType;
};
