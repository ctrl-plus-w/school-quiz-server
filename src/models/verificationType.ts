import { Optional, Sequelize, Model, DataTypes } from 'sequelize';

interface VerificationTypeAttributes {
  id: number;
  slug: string;
  name: string;
}

export type VerificationTypeCreationAttributes = Optional<VerificationTypeAttributes, 'id'>;

export class VerificationType
  extends Model<VerificationTypeAttributes, VerificationTypeCreationAttributes>
  implements VerificationTypeAttributes
{
  public id!: number;
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize): typeof VerificationType => {
  VerificationType.init(
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
      modelName: 'verificationType',
      tableName: 'VerificationType',
    }
  );

  return VerificationType;
};
