import { Optional, Sequelize } from 'sequelize/types';
import { Model, DataTypes } from 'sequelize';

interface RoleAttributes {
  id: number;
  slug: string;
  name: string;
  permission: number;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id'> {}

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public slug!: string;
  public name!: string;
  public permission!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Role.init(
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
