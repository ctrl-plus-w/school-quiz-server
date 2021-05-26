import { Sequelize } from 'sequelize/types';
import { Model, DataTypes } from 'sequelize';

export default (sequelize: Sequelize) => {
  interface GroupAttributes {
    slug: string;
    name: string;
  }

  class Label extends Model<GroupAttributes> implements GroupAttributes {
    slug!: string;
    name!: string;
  }

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
      modelName: 'Label',
      tableName: 'Label',
    }
  );

  return Label;
};
