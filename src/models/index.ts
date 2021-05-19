import { Sequelize as SequelizeClass } from 'sequelize/types';
import { Sequelize, DataTypes } from 'sequelize';

import user from './user';

const config = require(__dirname + '/../../config/sequelize-credentials.json')[process.env.NODE_ENV || 'development'];
const sequelize: SequelizeClass = new Sequelize(config.database, config.username, config.password, config);

export default {
  sequelize,
  models: {
    User: user(sequelize, DataTypes),
  },
};
