import sequelize, { Sequelize } from 'sequelize';

import credentials from '../constants/credentials';

const database: sequelize.Sequelize = new Sequelize(credentials.DB_URL);

export default database;
