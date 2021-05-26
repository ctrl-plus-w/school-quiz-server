import { Sequelize } from 'sequelize/types';
import { Model, DataTypes } from 'sequelize';

export default (sequelize: Sequelize) => {
  interface RoleAttributes {
    slug: string;
    name: string;
    permission: string;
  }

  class Role extends Model<RoleAttributes> implements RoleAttributes {
    public slug!: string;
    public name!: string;
    public permission!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Role.init(
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
      permission: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'Role',
    }
  );

  return Role;
};
