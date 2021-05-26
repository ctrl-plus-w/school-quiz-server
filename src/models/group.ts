import { Sequelize } from 'sequelize/types';
import { Model, DataTypes } from 'sequelize';

export default (sequelize: Sequelize) => {
  interface GroupAttributes {
    slug: string;
    name: string;
  }

  class Group extends Model<GroupAttributes> implements GroupAttributes {
    slug!: string;
    name!: string;

    static associate(models: any) {
      // define association here
    }
  }

  Group.init(
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
      modelName: 'Group',
      tableName: 'Group',
    }
  );

  return Group;
};
