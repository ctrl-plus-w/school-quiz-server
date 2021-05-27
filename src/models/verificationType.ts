import { Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

interface VerificationTypeAttributes {
  slug: Date;
  name: Date;
}

export class VerificationType extends Model<VerificationTypeAttributes> implements VerificationTypeAttributes {
  public slug!: Date;
  public name!: Date;

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
