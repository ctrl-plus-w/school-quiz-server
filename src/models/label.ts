import { Sequelize } from 'sequelize/types';
import { Model, DataTypes } from 'sequelize';

interface GroupAttributes {
  slug: string;
  name: string;
}

export class Label extends Model<GroupAttributes> implements GroupAttributes {
  public slug!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Label.init(
    {
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
