import { Sequelize as SequelizeClass } from 'sequelize/types';
import { Sequelize } from 'sequelize';

import user from './user';
import role from './role';
import group from './group';
import label from './label';

const config = require(__dirname + '/../../config/sequelize-credentials.json')[process.env.NODE_ENV || 'development'];
const sequelize: SequelizeClass = new Sequelize(config.database, config.username, config.password, config);

export default {
  sequelize,
  models: {
    User: user(sequelize),
    Role: role(sequelize),
    Group: group(sequelize),
    Label: label(sequelize),
  },
};
