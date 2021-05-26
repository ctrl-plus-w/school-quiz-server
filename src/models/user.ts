import { Sequelize } from 'sequelize/types';
import { Model, DataTypes } from 'sequelize';

export default (sequelize: Sequelize) => {
  interface UserAttributes {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    gender: boolean | null;
  }

  class User extends Model<UserAttributes> implements UserAttributes {
    username!: string;
    firstName!: string;
    lastName!: string;
    password!: string;
    gender!: boolean | null;

    static associate(models: any) {
      // define association here
    }
  }

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
      modelName: 'User',
      tableName: 'User',
    }
  );

  return User;
};
