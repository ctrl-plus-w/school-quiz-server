import { Association, Sequelize, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from 'sequelize/types';
import { Model, DataTypes } from 'sequelize';

import { Role } from './role';

interface UserAttributes {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  gender: boolean | null;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public username!: string;
  public firstName!: string;
  public lastName!: string;
  public password!: string;
  public gender!: boolean | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getRole!: BelongsToGetAssociationMixin<Role>;
  public setRole!: BelongsToSetAssociationMixin<Role, number>;

  public role!: Role;

  public static associations: {
    role: Association<User, Role>;
  };
}

export default (sequelize: Sequelize) => {
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'user',
      tableName: 'User',
    }
  );

  return User;
};
