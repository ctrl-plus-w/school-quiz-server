import { Optional, Sequelize, Model, DataTypes } from 'sequelize';

interface LabelAttributes {
  id: number;
  slug: string;
  name: string;
}

export type LabelCreationAttributes = Optional<LabelAttributes, 'id'>;

export class Label extends Model<LabelAttributes, LabelCreationAttributes> implements LabelAttributes {
  public id!: number;
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize): typeof Label => {
  Label.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'label',
      tableName: 'Label',
    }
  );

  return Label;
};
