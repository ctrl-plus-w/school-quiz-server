import { Sequelize } from 'sequelize/types';
import { Model, DataTypes } from 'sequelize';

interface RoleAttributes {
  slug: string;
  name: string;
  permission: number;
}

export class Role extends Model<RoleAttributes> implements RoleAttributes {
  public slug!: string;
  public name!: string;
  public permission!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
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
      modelName: 'role',
      tableName: 'Role',
    }
  );

  return Role;
};
